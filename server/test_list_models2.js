import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        const names = data.models.map(m => m.name);
        console.log("Total models:", names.length);
        console.log(names.join('\n'));
    } catch(e) {
        console.error("Failed to list models:", e);
    }
}
listModels();
