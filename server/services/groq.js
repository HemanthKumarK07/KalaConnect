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
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile', // Fast, highly capable model
      messages: messages,
      temperature: 0.7,
      max_tokens: 1500,
    });
    return response.choices[0].message;
  } catch (error) {
    console.error('Groq API Error:', error.message);
    throw error;
  }
};
