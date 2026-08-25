import { generateCompletion } from '../services/groq.js';

const SYSTEM_PROMPT = `
You are Kalai, the KalaConnect AI Assistant, an intelligent companion built into the KalaConnect platform.
KalaConnect is an AI-powered platform designed to support rural Indian artisans, sell authentic handmade products, provide educational craft courses (Craft Academy), and foster a supportive community.

Core Capabilities:
- Assist artisans with writing SEO-optimized product descriptions based on details they provide.
- Explain the authenticity verification process (we use AI to verify weave patterns, materials, etc.).
- Help users translate content (e.g. from regional Indian languages to English).
- Answer questions about traditional Indian handicrafts, arts, and culture.
- Provide general customer support and platform navigation help.

CRITICAL LANGUAGE RULES:
1. You MUST detect the language of the user's message and respond in that SAME language.
2. If the user's preferred language is provided, you MUST use that language by default.
3. You support ALL major Indian languages including: Hindi (हिन्दी), Tamil (தமிழ்), Telugu (తెలుగు), Kannada (ಕನ್ನಡ), Malayalam (മലയാളം), Marathi (मराठी), Gujarati (ગુજરાતી), Punjabi (ਪੰਜਾਬੀ), Bengali (বাংলা), Odia (ଓଡ଼ିଆ), Assamese (অসমীয়া), Urdu (اردو), Konkani, Kashmiri, Manipuri, Santali, Dogri, Maithili, Bodo, Sindhi, Nepali, Sanskrit.
4. If the user writes in mixed languages (e.g., Hindi + English), respond in that same mix.
5. Always maintain cultural sensitivity and respect for all Indian languages and dialects.

Guidelines:
1. Be polite, professional, and culturally respectful.
2. If a user asks about KalaConnect features, answer based on the platform's context.
3. If a user asks a general question (e.g., programming, history, general knowledge), answer it normally and helpfully. Do NOT refuse to answer general questions.
4. Format your responses using Markdown. Use bolding, bullet points, and code blocks where appropriate to make your response easy to read.
5. If the user asks you to verify an image or translate something without providing it, politely ask them to provide the text or describe the image (as you are a text-based assistant in this interface).
`;

const VERIFICATION_SYSTEM_PROMPT = 'You are a strict Authenticity Validator for Indian handcrafted goods. Inspect the image for evidence of handloom, pottery, wood carving, GI tags, or artisan workspaces. Explicitly REJECT receipts, bills, invoices, selfies, or unrelated items. Return ONLY a raw JSON object with no markdown formatting: { "verified": boolean, "reason": "Detailed explanation of what you see and why it is accepted or rejected." }';

// @desc    Verify an artisan craft image with xAI vision
// @route   POST /api/ai/verify
// @access  Private
export const verifyArtisanCraft = async (req, res, next) => {
  try {
    const { image } = req.body;

    if (!image || typeof image !== 'string') {
      return res.status(400).json({ verified: false, reason: 'An encoded craft image is required.' });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ verified: false, reason: 'AI verification is not configured.' });
    }

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'grok-4.6',
        messages: [
          { role: 'system', content: VERIFICATION_SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Verify this artisan craft image.' },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${image}` } }
            ]
          }
        ]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ verified: false, reason: data.error?.message || 'AI verification request failed.' });
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return res.status(502).json({ verified: false, reason: 'AI returned an empty verification response.' });
    }

    const parsed = JSON.parse(content.replace(/^```json\s*|\s*```$/g, '').trim());
    return res.status(200).json({
      verified: parsed.verified === true,
      reason: typeof parsed.reason === 'string' ? parsed.reason : 'The AI did not provide a verification reason.'
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return res.status(502).json({ verified: false, reason: 'AI returned an invalid verification response.' });
    }
    next(error);
  }
};

// @desc    Generate AI chat response
// @route   POST /api/ai/chat
// @access  Private
export const generateChatResponse = async (req, res, next) => {
  try {
    const { messages, language } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, message: 'Messages array is required' });
    }

    // Build language-aware system prompt
    let languageInstruction = '';
    if (language && language !== 'en') {
      const languageNames = {
        hi: 'Hindi', ta: 'Tamil', te: 'Telugu', kn: 'Kannada', ml: 'Malayalam',
        mr: 'Marathi', gu: 'Gujarati', pa: 'Punjabi', bn: 'Bengali', or: 'Odia',
        as: 'Assamese', ur: 'Urdu', kok: 'Konkani', ks: 'Kashmiri', mni: 'Manipuri',
        sat: 'Santali', doi: 'Dogri', mai: 'Maithili', brx: 'Bodo', sd: 'Sindhi',
        ne: 'Nepali', sa: 'Sanskrit'
      };
      const langName = languageNames[language] || language;
      languageInstruction = `\n\nIMPORTANT: The user's preferred language is ${langName} (${language}). You MUST respond in ${langName} unless the user explicitly writes in a different language. Use the native script for ${langName}.`;
    }

    // Prepend the system prompt to the conversation history
    const apiMessages = [
      { role: 'system', content: SYSTEM_PROMPT + languageInstruction },
      ...messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))
    ];

    const aiMessage = await generateCompletion(apiMessages);

    res.status(200).json({
      success: true,
      message: aiMessage, // Groq returns { role: 'assistant', content: '...' } just like OpenAI
    });
  } catch (error) {
    // Key is genuinely absent from .env
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ success: false, message: 'AI service is not configured. Please configure the server API key.' });
    }
    // Groq rejected the key (401) or forbidden (403)
    if (error.status === 401 || error.status === 403) {
      console.error('Groq auth error — check GROQ_API_KEY in server/.env');
      return res.status(500).json({ success: false, message: 'AI service authentication failed. Please check the server API key configuration.' });
    }
    // Rate limit
    if (error.status === 429) {
      return res.status(429).json({ success: false, message: 'AI Assistant rate limit exceeded. Please try again in a moment.' });
    }
    // All other errors
    next(error);
  }
};
