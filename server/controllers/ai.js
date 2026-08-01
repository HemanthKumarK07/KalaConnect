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
    if (error.status === 401 || (error.message && error.message.includes('key'))) {
       return res.status(500).json({ success: false, message: 'AI Assistant is currently unavailable due to missing API key configuration.' });
    }
    if (error.status === 429) {
       return res.status(429).json({ success: false, message: 'AI Assistant rate limit exceeded. Please try again later.' });
    }
    next(error);
  }
};
