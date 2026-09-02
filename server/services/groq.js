import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

let groqInstance = null;

export const getGroq = () => {
  if (!groqInstance) {
    if (!process.env.GROQ_API_KEY) {
      console.warn('⚠️ GROQ_API_KEY is not defined. AI Assistant will return an error.');
    }
    groqInstance = new Groq({
      apiKey: process.env.GROQ_API_KEY || 'MISSING_KEY',
    });
  }
  return groqInstance;
};

export const generateCompletion = async (messages) => {
  const groq = getGroq();
  try {
    // Only qwen supports vision, and only via public https:// URLs (not base64)
    const visionMessages = messages.map(m => {
      if (!Array.isArray(m.content)) return m;
      const filteredContent = m.content.filter(c => {
        if (c.type !== 'image_url') return true;
        const url = c.image_url?.url || '';
        return url.startsWith('https://') || url.startsWith('http://');
      });
      // If all image parts were filtered out (base64), flatten back to text-only
      if (filteredContent.length === 1 && filteredContent[0].type === 'text') {
        return { ...m, content: filteredContent[0].text };
      }
      return { ...m, content: filteredContent };
    });

    const response = await groq.chat.completions.create({
      model: 'qwen/qwen3.6-27b',
      messages: visionMessages,
      temperature: 0.7,
      max_tokens: 1500,
    });
    return response.choices[0].message;
  } catch (error) {
    console.error('Groq API Error:', error.message);
    throw error;
  }
};
