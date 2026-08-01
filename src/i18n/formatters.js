/**
 * KalaConnect — Localization Formatters
 * Date, time, number, and currency formatting using the Intl API.
 */

/**
 * Format currency in Indian Rupees with locale-appropriate formatting.
 * @param {number} amount - The amount to format
 * @param {string} lang - ISO 639 language code
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, lang = 'en') {
  const locale = getIntlLocale(lang);
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
}

/**
 * Format a number with locale-appropriate grouping and numerals.
 * @param {number} num - The number to format
 * @param {string} lang - ISO 639 language code
 * @returns {string} Formatted number string
 */
export function formatNumber(num, lang = 'en') {
  const locale = getIntlLocale(lang);
  try {
    return new Intl.NumberFormat(locale).format(num);
  } catch {
    return num.toLocaleString('en-IN');
  }
}

/**
 * Format a date according to the user's language.
 * @param {Date|string|number} date - The date to format
 * @param {string} lang - ISO 639 language code
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatDate(date, lang = 'en', options = {}) {
  const locale = getIntlLocale(lang);
  const dateObj = date instanceof Date ? date : new Date(date);
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };
  
  try {
    return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
  } catch {
    return dateObj.toLocaleDateString('en-IN', defaultOptions);
  }
}

/**
 * Format a date as a short string (e.g., "Aug 1, 2026").
 */
export function formatDateShort(date, lang = 'en') {
  return formatDate(date, lang, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format time according to the user's language.
 */
export function formatTime(date, lang = 'en') {
  const locale = getIntlLocale(lang);
  const dateObj = date instanceof Date ? date : new Date(date);
  
  try {
    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  } catch {
    return dateObj.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

/**
 * Format a relative time string (e.g., "2 hours ago", "3 days ago").
 * @param {Date|string|number} date - The date to compare against now
 * @param {string} lang - ISO 639 language code
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date, lang = 'en') {
  const locale = getIntlLocale(lang);
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffMs = now - dateObj;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    
    if (diffSecs < 60) return rtf.format(-diffSecs, 'second');
    if (diffMins < 60) return rtf.format(-diffMins, 'minute');
    if (diffHours < 24) return rtf.format(-diffHours, 'hour');
    if (diffDays < 7) return rtf.format(-diffDays, 'day');
    if (diffWeeks < 5) return rtf.format(-diffWeeks, 'week');
    if (diffMonths < 12) return rtf.format(-diffMonths, 'month');
    return rtf.format(-diffYears, 'year');
  } catch {
    // Fallback for browsers without RelativeTimeFormat
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDateShort(dateObj, lang);
  }
}

/**
 * Map our language codes to valid Intl locale strings.
 * Some of our codes (e.g., 'brx', 'sat') may not be supported by Intl,
 * so we map them to the closest available locale.
 */
function getIntlLocale(lang) {
  const localeMap = {
    en: 'en-IN',
    hi: 'hi-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    kn: 'kn-IN',
    ml: 'ml-IN',
    mr: 'mr-IN',
    gu: 'gu-IN',
    pa: 'pa-IN',
    bn: 'bn-IN',
    or: 'or-IN',
    as: 'as-IN',
    ur: 'ur-IN',
    kok: 'kok-IN',
    ks: 'ks-IN',
    mni: 'mni-IN',
    sat: 'sat-IN',
    doi: 'doi-IN',
    mai: 'mai-IN',
    brx: 'brx-IN',
    sd: 'sd-IN',
    ne: 'ne-IN',
    sa: 'sa-IN',
  };
  return localeMap[lang] || 'en-IN';
}

export { getIntlLocale };
