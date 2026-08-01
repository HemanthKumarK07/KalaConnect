import { create } from 'zustand';
import { useTranslation } from 'react-i18next';
import { getLanguage, DEFAULT_LANGUAGE } from '../i18n/languages';

const API_BASE = 'http://localhost:5000/api';

/**
 * Zustand store for language preference management.
 * Syncs language to localStorage and optionally to the server for logged-in users.
 */
const useLanguageStore = create((set, get) => ({
  // Current language code
  currentLanguage: localStorage.getItem('kalaconnect-language') || DEFAULT_LANGUAGE,

  /**
   * Change the application language.
   * Updates i18n, localStorage, and syncs to server if user is authenticated.
   */
  changeLanguage: async (langCode, i18nInstance, token = null) => {
    const langConfig = getLanguage(langCode);
    if (!langConfig) {
      console.warn(`[Language] Unsupported language code: ${langCode}`);
      return;
    }

    // Change i18n language (triggers re-render of all translated components)
    if (i18nInstance) {
      await i18nInstance.changeLanguage(langCode);
    }

    // Persist to localStorage
    localStorage.setItem('kalaconnect-language', langCode);

    // Update store
    set({ currentLanguage: langCode });

    // Sync to server if authenticated
    if (token) {
      try {
        await fetch(`${API_BASE}/users/language`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ language: langCode }),
        });
      } catch (err) {
        console.warn('[Language] Failed to sync language to server:', err);
        // Non-blocking — local change still works
      }
    }
  },

  /**
   * Initialize language from user profile (after login).
   * Profile language takes priority over localStorage.
   */
  initFromProfile: (profileLang, i18nInstance) => {
    if (profileLang && getLanguage(profileLang)) {
      localStorage.setItem('kalaconnect-language', profileLang);
      set({ currentLanguage: profileLang });
      if (i18nInstance) {
        i18nInstance.changeLanguage(profileLang);
      }
    }
  },
}));

export default useLanguageStore;
