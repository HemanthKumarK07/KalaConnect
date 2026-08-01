import fs from 'fs';
import path from 'path';
import { translate } from 'google-translate-api-x';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES_DIR = path.join(__dirname, '../../src/i18n/locales');
const EN_DIR = path.join(LOCALES_DIR, 'en');

const namespaces = ['common', 'landing', 'marketplace', 'auth', 'academy', 'community', 'dashboard', 'checkout', 'ai'];

const TARGET_LANGS = [
  { code: 'ta', googleCode: 'ta' },
  { code: 'te', googleCode: 'te' },
  { code: 'kn', googleCode: 'kn' },
  { code: 'ml', googleCode: 'ml' }
];

// Flatten object to array of paths and values
function flattenObj(obj, prefix = '') {
  let flat = [];
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === 'string') {
      flat.push({ path: prefix ? `${prefix}.${key}` : key, value: val });
    } else if (typeof val === 'object' && val !== null) {
      flat = flat.concat(flattenObj(val, prefix ? `${prefix}.${key}` : key));
    }
  }
  return flat;
}

// Unflatten array back to object
function unflattenObj(flatList) {
  const obj = {};
  for (const item of flatList) {
    const parts = item.path.split('.');
    let curr = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!curr[parts[i]]) curr[parts[i]] = {};
      curr = curr[parts[i]];
    }
    curr[parts[parts.length - 1]] = item.value;
  }
  return obj;
}

async function run() {
  console.log('Loading English base translations...');
  const enData = {};
  for (const ns of namespaces) {
    const p = path.join(EN_DIR, `${ns}.json`);
    if (fs.existsSync(p)) {
      enData[ns] = JSON.parse(fs.readFileSync(p, 'utf-8'));
    }
  }

  for (const lang of TARGET_LANGS) {
    console.log(`\nTranslating to ${lang.code} (${lang.googleCode})...`);
    const langDir = path.join(LOCALES_DIR, lang.code);
    if (!fs.existsSync(langDir)) fs.mkdirSync(langDir, { recursive: true });

    for (const ns of namespaces) {
      if (!enData[ns]) continue;
      
      const flat = flattenObj(enData[ns]);
      const stringsToTranslate = flat.map(f => f.value);
      
      console.log(`  Translating namespace: ${ns}.json (${stringsToTranslate.length} keys)`);
      
      if (stringsToTranslate.length === 0) continue;

      try {
        // Chunk requests to avoid URL length limits
        const chunkSize = 20;
        const translatedStrings = [];
        
        for (let i = 0; i < stringsToTranslate.length; i += chunkSize) {
          const chunk = stringsToTranslate.slice(i, i + chunkSize);
          const res = await translate(chunk, { to: lang.googleCode });
          
          if (Array.isArray(res)) {
            translatedStrings.push(...res.map(r => r.text));
          } else {
            // If there's only 1 string in chunk, res is an object
            translatedStrings.push(res.text);
          }
          await new Promise(r => setTimeout(r, 200)); // sleep between chunks
        }
        
        for (let i = 0; i < flat.length; i++) {
          flat[i].value = translatedStrings[i] || flat[i].value;
        }

        const translatedObj = unflattenObj(flat);
        fs.writeFileSync(path.join(langDir, `${ns}.json`), JSON.stringify(translatedObj, null, 2));

      } catch (err) {
        console.error(`  [ERROR] Failed to translate ${ns}:`, err.message);
      }
    }
    console.log(`[SUCCESS] Completed ${lang.code}`);
  }
}

run().catch(console.error);
