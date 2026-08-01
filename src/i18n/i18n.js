/**
 * KalaConnect — i18next Configuration
 * Lazy-loaded namespace-based translations with browser language detection.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { LANGUAGE_CODES, DEFAULT_LANGUAGE } from './languages.js';

/** All translation namespaces. Each is lazy-loaded independently. */
const NAMESPACES = [
  'common',
  'landing',
  'marketplace',
  'auth',
  'academy',
  'community',
  'dashboard',
  'checkout',
  'ai',
];

/**
 * Dynamic import loader for translation JSON files.
 * Vite's import.meta.glob is used for lazy loading with code splitting.
 */
const translationModules = import.meta.glob('./locales/**/*.json');

/**
 * Custom backend that lazy-loads translation JSON files on demand.
 */
const LazyImportBackend = {
  type: 'backend',
  init() {},
  read(language, namespace, callback) {
    const path = `./locales/${language}/${namespace}.json`;
    const loader = translationModules[path];

    if (!loader) {
      // Fallback: if translation file doesn't exist, return empty
      callback(null, {});
      return;
    }

    loader()
      .then((module) => {
        callback(null, module.default || module);
      })
      .catch((err) => {
        console.warn(`[i18n] Failed to load ${language}/${namespace}:`, err);
        callback(null, {});
      });
  },
};

i18n
  .use(LazyImportBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // Supported languages
    supportedLngs: LANGUAGE_CODES,
    
    // Fallback language
    fallbackLng: DEFAULT_LANGUAGE,
    
    // Default namespace
    defaultNS: 'common',
    
    // All available namespaces
    ns: NAMESPACES,
    
    // Language detection order
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'kalaconnect-language',
      caches: ['localStorage'],
    },
    
    // Interpolation settings
    interpolation: {
      escapeValue: false, // React already escapes
      formatSeparator: ',',
    },
    
    // React-specific settings
    react: {
      useSuspense: true,
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
    },
    
    // Load namespaces on demand (not all at once)
    partialBundledLanguages: true,
    
    // Don't load all namespaces on init — just common
    preload: [DEFAULT_LANGUAGE],
    
    // Return key if translation missing (development aid)
    returnNull: false,
    returnEmptyString: false,
    
    // Key separator for nested keys (e.g., 'nav.home')
    keySeparator: '.',
    
    // Namespace separator
    nsSeparator: ':',
    
    // Plural separator
    pluralSeparator: '_',
    
    // Context separator
    contextSeparator: '_',
    
    // Debug mode (disable in production)
    debug: false,
  });

export default i18n;
export { NAMESPACES };
