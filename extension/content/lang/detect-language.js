/**
 * Detects the user's preferred language based on browser settings and YouTube interface
 * @returns {Promise<string>} Language code (e.g., 'en', 'de', 'ja')
 */
export async function detectLanguage() {
  // First try to get language from YouTube interface
  const ytLangElement = document.querySelector('html[lang]');
  if (ytLangElement) {
    const ytLang = ytLangElement.getAttribute('lang');
    if (ytLang) {
      return ytLang.split('-')[0]; // Convert 'en-US' to 'en'
    }
  }

  // Fallback to browser language
  const browserLang = navigator.language || navigator.languages[0];
  return browserLang.split('-')[0];
}

/**
 * Gets the full language name from a language code
 * @param {string} langCode - Language code (e.g., 'en', 'de', 'ja')
 * @returns {string} Full language name
 */
export function getLanguageName(langCode) {
  const languages = {
    en: 'English',
    de: 'Deutsch',
    ja: '日本語',
    es: 'Español',
    fr: 'Français',
    it: 'Italiano',
    pt: 'Português',
    ru: 'Русский',
    zh: '中文',
    ko: '한국어'
  };
  return languages[langCode] || langCode;
}
