/**
 * Script to generate template translation files for all remaining languages.
 * Run: node src/i18n/generate-templates.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const localesDir = join(__dirname, 'locales');
const enDir = join(localesDir, 'en');

// All language codes that need templates (excluding en and hi which are complete)
const langs = [
  'ta', 'te', 'kn', 'ml', 'mr', 'gu', 'pa', 'bn', 'or', 'as',
  'ur', 'kok', 'ks', 'mni', 'sat', 'doi', 'mai', 'brx', 'sd', 'ne', 'sa'
];

// Get all namespace files from English directory
const namespaces = readdirSync(enDir).filter(f => f.endsWith('.json'));

let filesCreated = 0;

for (const lang of langs) {
  const langDir = join(localesDir, lang);
  if (!existsSync(langDir)) {
    mkdirSync(langDir, { recursive: true });
  }

  for (const nsFile of namespaces) {
    const targetPath = join(langDir, nsFile);
    if (existsSync(targetPath)) {
      console.log(`  SKIP ${lang}/${nsFile} (exists)`);
      continue;
    }

    // Read English source as template
    const enContent = JSON.parse(readFileSync(join(enDir, nsFile), 'utf8'));

    // Write the English content as a template (fallback handles missing translations)
    writeFileSync(targetPath, JSON.stringify(enContent, null, 2) + '\n', 'utf8');
    filesCreated++;
  }
  console.log(`✓ ${lang}/ — ${namespaces.length} files`);
}

console.log(`\nDone! Created ${filesCreated} template files for ${langs.length} languages.`);
console.log('Note: These use English text as placeholders. Replace with actual translations for each language.');
