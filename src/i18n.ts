import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translations
import en from './locales/en/translation.json';
import hi from './locales/hi/translation.json';
import gu from './locales/gu/translation.json';
import mr from './locales/mr/translation.json';

const LANGUAGE_KEY = 'APP_LANGUAGE';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  gu: { translation: gu },
  mr: { translation: mr },
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

// Persisted language helpers
export const setAppLanguage = async (lng: string) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, lng);
  } catch (e) {
    // noop
  }
  i18n.changeLanguage(lng);
};

export const getSavedLanguage = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(LANGUAGE_KEY);
  } catch (e) {
    return null;
  }
};

export const clearSavedLanguage = async () => {
  try {
    await AsyncStorage.removeItem(LANGUAGE_KEY);
  } catch (e) {
    // noop
  }
};

export const getCurrentLanguage = (): string => i18n.language || 'en';

// On app start, attempt to load and apply saved language
getSavedLanguage().then(saved => {
  if (saved && saved !== i18n.language) {
    i18n.changeLanguage(saved);
  }
});