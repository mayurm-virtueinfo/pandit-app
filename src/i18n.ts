import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
import en from './locales/en/translation.json';
import hi from './locales/hi/translation.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React handles XSS
    },
  });

export default i18n;
export const changeLanguage = (lng: string) => {
  i18n.changeLanguage(lng);
};