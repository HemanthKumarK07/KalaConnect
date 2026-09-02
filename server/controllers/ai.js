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
5. If the user asks you to verify an image or translate something without providing it, politely ask them to provide the text or the image (you CAN view images if they upload them).
6. CRITICAL: Answer concisely. Provide ONLY what is needed without any extra conversational filler or unnecessary details.
`;

const VERIFICATION_SYSTEM_PROMPT = 'You are a strict Authenticity Validator for Indian handcrafted goods. Inspect the image for evidence of handloom, pottery, wood carving, GI tags, or artisan workspaces. Explicitly REJECT receipts, bills, invoices, selfies, or unrelated items. Return ONLY a raw JSON object with no markdown, no code fences, no extra text: {"verified": boolean, "reason": "Detailed explanation of what you see and why it is accepted or rejected."}';

// @desc    Verify an artisan craft image with Groq vision
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

    const { getGroq } = await import('../services/groq.js');
    const groq = getGroq();

    // Groq vision requires a public https:// URL — base64 is not supported
    if (!image.startsWith('https://') && !image.startsWith('http://')) {
      return res.status(400).json({ verified: false, reason: 'Only public image URLs (Cloudinary links) are supported for verification. Please upload the image first.' });
    }

    const response = await groq.chat.completions.create({
      model: 'qwen/qwen3.6-27b',
      messages: [
        { role: 'system', content: VERIFICATION_SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Verify this artisan craft image.' },
            { type: 'image_url', image_url: { url: image } }
          ]
        }
      ],
      temperature: 0.2,
      max_tokens: 300,
    });

    let content = response.choices?.[0]?.message?.content;
    if (!content) {
      return res.status(502).json({ verified: false, reason: 'AI returned an empty verification response.' });
    }

    // Strip <think> tags and markdown fences, then extract JSON
    content = content.replace(/<think>[\s\S]*?<\/think>\s*/gi, '').trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(502).json({ verified: false, reason: 'AI returned an unrecognized verification response.' });
    }

    const parsed = JSON.parse(jsonMatch[0]);
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
      ...messages.map(msg => {
        if (msg.image) {
          return {
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: [
              { type: 'text', text: msg.content },
              { type: 'image_url', image_url: { url: msg.image.startsWith('data:') ? msg.image : `data:image/jpeg;base64,${msg.image}` } }
            ]
          };
        }
        return {
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        };
      })
    ];

    const aiMessage = await generateCompletion(apiMessages);

    if (aiMessage && typeof aiMessage.content === 'string') {
      aiMessage.content = aiMessage.content.replace(/<think>[\s\S]*?<\/think>\s*/gi, '').trim();
    }

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

// @desc    Analyze product image to generate description and price
// @route   POST /api/ai/analyze-image
// @access  Private
export const analyzeProductImage = async (req, res, next) => {
  try {
    const { image } = req.body;

    if (!image || typeof image !== 'string') {
      return res.status(400).json({ success: false, message: 'An image URL is required.' });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ success: false, message: 'AI configuration is missing.' });
    }

    // Only public https:// URLs work with qwen vision
    if (!image.startsWith('https://') && !image.startsWith('http://')) {
      return res.status(400).json({ success: false, message: 'Only public image URLs (Cloudinary links) are supported for AI analysis. Please upload the image first.' });
    }

    const { getGroq } = await import('../services/groq.js');
    const groq = getGroq();

    const systemPrompt = `You are a product description writer for Indian handcrafted goods on a fair-trade marketplace.
Analyze the image and identify the handcrafted item, its materials, and craft style.
Write a compelling 2–3 sentence product description suitable for an e-commerce listing.

PRICING RULES (follow exactly):
- Base price on ACTUAL Indian market rates for handmade goods.
- Simple pottery / clay / small decor: ₹80–₹400
- Small wooden toys / keychains / coasters: ₹60–₹350
- Medium textiles (scarves, small dupattas): ₹300–₹900
- Paintings (small, A4 size): ₹200–₹800
- Jewelry (basic beads, thread): ₹80–₹600
- Larger items (full sarees, big sculptures): ₹800–₹3000
- Simple or small items → price LOW (₹80–₹300). Do NOT default to ₹1500+ unless clearly premium.
- estimatedPrice must be an integer.

Output ONLY valid JSON — no markdown, no code fences, no extra text whatsoever:
{"description": "...", "estimatedPrice": 250}`;

    const response = await groq.chat.completions.create({
      model: 'qwen/qwen3.6-27b',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this product image and provide a description and price as JSON.' },
            { type: 'image_url', image_url: { url: image } }
          ]
        }
      ],
      temperature: 0.5,
      max_tokens: 500,
    });

    let content = response.choices[0]?.message?.content;
    if (!content) {
      return res.status(502).json({ success: false, message: 'AI returned an empty response.' });
    }

    // Strip <think> tags and markdown fences, then extract JSON
    content = content.replace(/<think>[\s\S]*?<\/think>\s*/gi, '').trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(502).json({ success: false, message: 'AI returned an unrecognized response format.' });
    }
    const parsed = JSON.parse(jsonMatch[0]);

    return res.status(200).json({
      success: true,
      data: {
        description: parsed.description || 'Description not available',
        estimatedPrice: parsed.estimatedPrice || 0
      }
    });

  } catch (error) {
    if (error instanceof SyntaxError) {
      return res.status(502).json({ success: false, message: 'AI returned an invalid response format.' });
    }
    console.error('AI Image Analysis Error:', error.message);
    next(error);
  }
};
