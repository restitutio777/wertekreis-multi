import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations directly instead of using backend
import deTranslations from '../public/locales/de/translation.json';
import enTranslations from '../public/locales/en/translation.json';
import frTranslations from '../public/locales/fr/translation.json';

const resources = {
  de: {
    translation: deTranslations
  },
  en: {
    translation: enTranslations
  },
  fr: {
    translation: frTranslations
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'de',
    lng: 'de', // Force German as default
    debug: false,
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },

    detection: {
      order: ['localStorage', 'htmlTag', 'navigator'],
      caches: ['localStorage'],
    },

    supportedLngs: ['de', 'en', 'fr'],
    
    ns: ['translation'],
    defaultNS: 'translation',
    
    // Ensure immediate loading
    initImmediate: false,
    load: 'languageOnly',
  });

// Update URL when language changes via selector
i18n.on('languageChanged', (lng) => {
  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  const currentPage = pathSegments[1] || 'home'; // Assuming page is the second segment
  const newPath = `/${lng}/${currentPage}`;
  window.history.pushState({ page: currentPage, lang: lng }, '', newPath);
});

export default i18n;