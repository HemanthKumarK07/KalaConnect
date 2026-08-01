import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function listModels() {
    try {
        const models = await groq.models.list();
        const names = models.data.map(m => m.id);
        console.log(names.join('\n'));
    } catch(e) {
        console.error("Failed to list models:", e);
    }
}
listModels();
