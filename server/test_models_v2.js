import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testModels() {
    const models = ["gemini-2.0-flash", "gemini-flash-latest", "gemini-3.5-flash"];
    
    for (const m of models) {
        try {
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("hello");
            console.log(`✅ Success for ${m}`);
        } catch(e) {
            console.error(`❌ Failed for ${m}: ${e.message}`);
        }
    }
}
testModels();
