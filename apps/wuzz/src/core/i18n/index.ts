import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { getLocales } from 'react-native-localize';

import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  LANGUAGE_STORAGE,
  NAMESPACES,
  type LanguageCode,
} from './config';

const deviceLanguage = getLocales()[0]?.languageCode ?? DEFAULT_LANGUAGE;
const savedLanguage = LANGUAGE_STORAGE.getString(LANGUAGE_STORAGE_KEY) as LanguageCode | undefined;

const locales: Record<string, Record<string, unknown>> = {
    en: {
      common: require('../../../public/locales/en/common.json'),
      home: require('../../../public/locales/en/home.json'),
      outlet: require('../../../public/locales/en/outlet.json'),
      history: require('../../../public/locales/en/history.json'),
      login: require('../../../public/locales/en/auth/login.json'),
      register: require('../../../public/locales/en/auth/register.json'),
    },
    id: {
      common: require('../../../public/locales/id/common.json'),
      home: require('../../../public/locales/id/home.json'),
      outlet: require('../../../public/locales/id/outlet.json'),
      history: require('../../../public/locales/id/history.json'),
      login: require('../../../public/locales/id/auth/login.json'),
      register: require('../../../public/locales/id/auth/register.json'),
    },
  };

i18n
  .use(
    resourcesToBackend((language: string, namespace: string) =>
      Promise.resolve(locales[language]?.[namespace])
    )
  )
  .use(initReactI18next)
  .init({
    defaultNS: 'common',
    ns: NAMESPACES,
    lng: savedLanguage ?? deviceLanguage,
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: {
      escapeValue: false,
    },
  });

export const changeLanguage = (code: LanguageCode) => {
  LANGUAGE_STORAGE.set(LANGUAGE_STORAGE_KEY, code);
  i18n.changeLanguage(code);
};

export default i18n;