/**
 * KalaConnect — Language Registry
 * Central registry of all supported languages.
 * To add a new language, simply add an entry here and create translation files.
 * Zero code changes required elsewhere.
 */

export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr', script: 'Latin', font: 'Inter', region: 'Pan-India' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr', script: 'Devanagari', font: 'Noto Sans Devanagari', region: 'North India' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', dir: 'ltr', script: 'Tamil', font: 'Noto Sans Tamil', region: 'Tamil Nadu' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', dir: 'ltr', script: 'Telugu', font: 'Noto Sans Telugu', region: 'Andhra Pradesh, Telangana' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', dir: 'ltr', script: 'Kannada', font: 'Noto Sans Kannada', region: 'Karnataka' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', dir: 'ltr', script: 'Malayalam', font: 'Noto Sans Malayalam', region: 'Kerala' },
];

/** Get a language object by its code */
export const getLanguage = (code) => LANGUAGES.find(l => l.code === code);

/** Get all supported language codes */
export const LANGUAGE_CODES = LANGUAGES.map(l => l.code);

/** Get RTL language codes */
export const RTL_LANGUAGES = LANGUAGES.filter(l => l.dir === 'rtl').map(l => l.code);

/** Check if a language code is RTL */
export const isRTL = (code) => RTL_LANGUAGES.includes(code);

/** Get the default/fallback language */
export const DEFAULT_LANGUAGE = 'en';

/** Get unique font families needed (deduped since many languages share Devanagari) */
export const UNIQUE_FONTS = [...new Set(LANGUAGES.map(l => l.font).filter(f => f !== 'Inter'))];
