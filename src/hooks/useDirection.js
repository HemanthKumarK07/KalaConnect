import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getLanguage, isRTL } from '../i18n/languages';

/**
 * Hook that manages document direction (LTR/RTL), lang attribute,
 * and data-lang attribute based on the current i18n language.
 * Should be called once at the app root level.
 */
export default function useDirection() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const lang = i18n.language;
    const langConfig = getLanguage(lang);
    const dir = langConfig?.dir || 'ltr';

    // Set document direction
    document.documentElement.dir = dir;

    // Set lang attribute for accessibility and SEO
    document.documentElement.lang = lang;

    // Set data-lang for CSS font selection
    document.documentElement.setAttribute('data-lang', lang);

    // Add/remove RTL class on body for additional styling hooks
    if (isRTL(lang)) {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }, [i18n.language]);

  return {
    direction: isRTL(i18n.language) ? 'rtl' : 'ltr',
    language: i18n.language,
    isRTL: isRTL(i18n.language),
  };
}
