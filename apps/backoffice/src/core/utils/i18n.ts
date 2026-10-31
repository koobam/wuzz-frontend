import i18n from 'i18next';
import { initReactI18next, Trans, useTranslation } from 'react-i18next';
import { initialLanguage, LANGUAGES, setLanguage, type LanguageCode } from '@wuzz/web-ui';

/**
 * The copy lives in src/locales/<language>/<namespace>.json. Those files are what Phrase
 * pushes and pulls (see .phrase.yml at the repo root), so a translation is never typed
 * into the code.
 */

const files = import.meta.glob('../../locales/*/*.json', { eager: true, import: 'default' }) as Record<
  string,
  Record<string, unknown>
>;
// One file per page (locales/<language>/<page>.json), so a translator or a diff only meets one screen at a
// time. Their top-level keys never overlap, so for i18next a language is the files merged into one dictionary.
const dictionaries: Record<string, Record<string, unknown>> = {};
for (const [path, data] of Object.entries(files)) {
  const match = path.match(/locales\/([^/]+)\/([^/]+)\.json$/);
  if (!match) continue;
  const [, language, page] = match;
  const dictionary = (dictionaries[language!] ??= {});
  for (const key of Object.keys(data)) {
    if (import.meta.env.DEV && key in dictionary) console.warn(`i18n: "${key}" is defined twice (again in ${page}.json)`);
  }
  Object.assign(dictionary, data);
}
const resources = Object.fromEntries(Object.entries(dictionaries).map(([language, dictionary]) => [language, { common: dictionary }]));

void i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage(),
  fallbackLng: 'en',
  defaultNS: 'common',
  interpolation: { escapeValue: false },
});
document.documentElement.lang = i18n.language;

export { i18n, LANGUAGES, setLanguage, Trans, useTranslation };
export type { LanguageCode };
