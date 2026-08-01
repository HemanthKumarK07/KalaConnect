import fs from 'fs';
import path from 'path';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const LANGUAGES = [
  { code: 'hi', name: 'Hindi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'mr', name: 'Marathi' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'or', name: 'Odia' },
  { code: 'as', name: 'Assamese' },
  { code: 'ur', name: 'Urdu' },
  { code: 'kok', name: 'Konkani' },
  { code: 'ks', name: 'Kashmiri' },
  { code: 'mni', name: 'Manipuri' },
  { code: 'sat', name: 'Santali' },
  { code: 'doi', name: 'Dogri' },
  { code: 'mai', name: 'Maithili' },
  { code: 'brx', name: 'Bodo' },
  { code: 'sd', name: 'Sindhi' },
  { code: 'ne', name: 'Nepali' },
  { code: 'sa', name: 'Sanskrit' }
];

const LOCALES_DIR = path.join(__dirname, '../../src/i18n/locales');
const EN_DIR = path.join(LOCALES_DIR, 'en');

const namespaces = ['common', 'landing', 'marketplace', 'auth', 'academy', 'community', 'dashboard', 'checkout', 'ai'];

async function translateAll() {
  console.log('Reading English source files...');
  const enData = {};
  for (const ns of namespaces) {
    const filePath = path.join(EN_DIR, `${ns}.json`);
    if (fs.existsSync(filePath)) {
      enData[ns] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  }

  const enDataString = JSON.stringify(enData);
  console.log(`Source data size: ${enDataString.length} characters`);

  for (const lang of LANGUAGES) {
    const langDir = path.join(LOCALES_DIR, lang.code);
    if (!fs.existsSync(langDir)) {
      fs.mkdirSync(langDir, { recursive: true });
    }

    console.log(`Translating to ${lang.name} (${lang.code})...`);
    
    const testFile = path.join(langDir, 'common.json');
    if (fs.existsSync(testFile)) {
       try {
         const content = JSON.parse(fs.readFileSync(testFile, 'utf8'));
         if (content.nav && content.nav.home !== 'Home') {
           console.log(`[SKIP] ${lang.name} already seems translated.`);
           continue;
         }
       } catch (e) {
         // skip
       }
    }

    const prompt = `You are a professional translator. Translate the following JSON object from English to ${lang.name}.
IMPORTANT RULES:
1. Return ONLY valid JSON, nothing else. No markdown wrappers.
2. Keep all the exact same JSON keys, only translate the values.
3. Keep interpolation variables like {{language}} or {{count}} exactly as they are.
4. If a language doesn't have an exact translation, provide the closest conceptual equivalent or transliterate.

Source JSON:
${enDataString}
`;

    try {
      const response = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      });

      let translatedText = response.choices[0]?.message?.content;
      if (!translatedText) throw new Error("No content in response");

      if (translatedText.startsWith('```json')) {
        translatedText = translatedText.replace(/^```json\n/, '').replace(/\n```$/, '');
      }

      const translatedData = JSON.parse(translatedText);

      for (const ns of namespaces) {
        if (translatedData[ns]) {
          fs.writeFileSync(path.join(langDir, `${ns}.json`), JSON.stringify(translatedData[ns], null, 2));
        }
      }

      console.log(`[SUCCESS] Translated ${lang.name}`);
      
      // Sleep for 3 seconds to respect rate limits
      await new Promise(r => setTimeout(r, 3000));
    } catch (error) {
      console.error(`[ERROR] Failed to translate ${lang.name}:`, error.message);
    }
  }
  
  console.log('All translations completed!');
}

translateAll();
