import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import { MMKV } from 'react-native-mmkv';

import en from '../locales/en/common.json';
import id from '../locales/id/common.json';

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'id', label: 'Indonesia' },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];

const DEFAULT_LANGUAGE: LanguageCode = 'en';
const LANGUAGE_STORAGE_KEY = 'app_language';
const storage = new MMKV();

const isLanguage = (code: string | undefined): code is LanguageCode =>
  LANGUAGES.some(language => language.code === code);

const saved = storage.getString(LANGUAGE_STORAGE_KEY);

i18n.use(initReactI18next).init({
  resources: { en: { common: en }, id: { common: id } },
  defaultNS: 'common',
  ns: ['common'],
  lng: isLanguage(saved) ? saved : DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false },
});

export const setLanguage = (code: LanguageCode) => {
  storage.set(LANGUAGE_STORAGE_KEY, code);
  return i18n.changeLanguage(code);
};

export { i18n, useTranslation };
