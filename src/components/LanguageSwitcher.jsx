import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Search, Check, X, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../i18n/languages';
import useLanguageStore from '../store/useLanguageStore';
import useAuthStore from '../store/useAuthStore';
import { useToast } from './Toast';
import './LanguageSwitcher.css';

/**
 * Premium searchable language selector with:
 * - Desktop: Floating dropdown with search & smooth animations
 * - Mobile: Full-screen modal with large touch targets
 * - Keyboard accessible (arrow keys, Enter, Escape)
 * - Native script rendering for every language
 * - Grouped by script family for easy discovery
 */
export default function LanguageSwitcher({ variant = 'navbar' }) {
  const { i18n, t } = useTranslation();
  const { changeLanguage } = useLanguageStore();
  const { token } = useAuthStore();
  const { showToast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const listRef = useRef(null);

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  // Filter languages by search
  const filteredLanguages = useMemo(() => {
    if (!search.trim()) return LANGUAGES;
    const s = search.toLowerCase();
    return LANGUAGES.filter(
      l =>
        l.name.toLowerCase().includes(s) ||
        l.nativeName.toLowerCase().includes(s) ||
        l.region.toLowerCase().includes(s) ||
        l.code.toLowerCase().includes(s)
    );
  }, [search]);

  // Group by script family
  const groupedLanguages = useMemo(() => {
    const groups = {};
    filteredLanguages.forEach(lang => {
      const group = lang.script;
      if (!groups[group]) groups[group] = [];
      groups[group].push(lang);
    });
    return groups;
  }, [filteredLanguages]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search on open
      setTimeout(() => searchRef.current?.focus(), 100);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Prevent body scroll when mobile modal is open
  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleSelect = useCallback(async (lang) => {
    if (lang.code === i18n.language) {
      setIsOpen(false);
      setSearch('');
      return;
    }

    await changeLanguage(lang.code, i18n, token);
    showToast(t('notifications.languageChanged', { language: lang.nativeName }), 'success');
    setIsOpen(false);
    setSearch('');
  }, [i18n, changeLanguage, token, showToast, t]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return;

    const flatList = filteredLanguages;
    
    const scrollToItem = (index) => {
      setTimeout(() => {
        if (listRef.current) {
          const items = listRef.current.querySelectorAll('.lang-switcher__item');
          items[index]?.scrollIntoView({ block: 'nearest' });
        }
      }, 0);
    };

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => {
          const next = Math.min(prev + 1, flatList.length - 1);
          scrollToItem(next);
          return next;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => {
          const next = Math.max(prev - 1, 0);
          scrollToItem(next);
          return next;
        });
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < flatList.length) {
          handleSelect(flatList[focusedIndex]);
        }
        break;
    }
  }, [isOpen, filteredLanguages, focusedIndex, handleSelect]);

  return (
    <div className="lang-switcher" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        className="lang-switcher__trigger"
        onClick={() => { setIsOpen(!isOpen); setFocusedIndex(-1); }}
        aria-label={t('accessibility.languageSwitcher')}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        title={t('labels.selectLanguage')}
      >
        <Globe size={16} className="lang-switcher__icon" />
        <span className="lang-switcher__current">{currentLang.nativeName}</span>
        <ChevronDown size={14} className={`lang-switcher__chevron ${isOpen ? 'lang-switcher__chevron--open' : ''}`} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile backdrop */}
            <motion.div
              className="lang-switcher__backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => { setIsOpen(false); setSearch(''); }}
            />

            <motion.div
              className="lang-switcher__dropdown"
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              role="listbox"
              aria-label={t('labels.selectLanguage')}
              onKeyDown={handleKeyDown}
            >
              {/* Header */}
              <div className="lang-switcher__header">
                <h3 className="lang-switcher__title">
                  <Globe size={16} />
                  {t('labels.selectLanguage')}
                </h3>
                <button
                  className="lang-switcher__close"
                  onClick={() => { setIsOpen(false); setSearch(''); }}
                  aria-label={t('buttons.close')}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Search */}
              <div className="lang-switcher__search-wrap">
                <Search size={15} className="lang-switcher__search-icon" />
                <input
                  ref={searchRef}
                  type="text"
                  className="lang-switcher__search"
                  placeholder={t('labels.searchLanguage')}
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setFocusedIndex(-1); }}
                  aria-label={t('labels.searchLanguage')}
                />
                {search && (
                  <button
                    className="lang-switcher__search-clear"
                    onClick={() => setSearch('')}
                    aria-label={t('search.clear', { ns: 'marketplace' })}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Language List */}
              <div className="lang-switcher__list" ref={listRef} data-lenis-prevent="true">
                {filteredLanguages.length === 0 ? (
                  <div className="lang-switcher__empty">
                    No languages found
                  </div>
                ) : (
                  Object.entries(groupedLanguages).map(([script, langs]) => (
                    <div key={script} className="lang-switcher__group">
                      <div className="lang-switcher__group-label">{script}</div>
                      {langs.map((lang) => {
                        const flatIdx = filteredLanguages.indexOf(lang);
                        const isActive = lang.code === i18n.language;
                        const isFocused = flatIdx === focusedIndex;

                        return (
                          <button
                            key={lang.code}
                            className={`lang-switcher__item ${isActive ? 'lang-switcher__item--active' : ''} ${isFocused ? 'lang-switcher__item--focused' : ''}`}
                            role="option"
                            aria-selected={isActive}
                            onClick={() => handleSelect(lang)}
                            onMouseEnter={() => setFocusedIndex(flatIdx)}
                          >
                            <div className="lang-switcher__item-info">
                              <span className="lang-switcher__item-native">{lang.nativeName}</span>
                              <span className="lang-switcher__item-english">{lang.name}</span>
                            </div>
                            <div className="lang-switcher__item-meta">
                              <span className="lang-switcher__item-region">{lang.region}</span>
                              {isActive && <Check size={16} className="lang-switcher__item-check" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="lang-switcher__footer">
                <span>{LANGUAGES.length} languages supported</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
