import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';

/**
 * The copy lives in src/locales/<language>/<namespace>.json. Those files are what Phrase
 * pushes and pulls (see .phrase.yml at the repo root), so a translation is never typed
 * into the code.
 */
export const LANGUAGES = [
  { code: 'en', label: 'English', country: 'US' },
  { code: 'id', label: 'Indonesia', country: 'ID' },
] as const;
export type LanguageCode = (typeof LANGUAGES)[number]['code'];

const STORAGE_KEY = 'lang';

const files = import.meta.glob('../locales/*/*.json', { eager: true, import: 'default' }) as Record<
  string,
  Record<string, unknown>
>;
const resources: Record<string, Record<string, Record<string, unknown>>> = {};
for (const [path, data] of Object.entries(files)) {
  const match = path.match(/locales\/([^/]+)\/([^/]+)\.json$/);
  if (!match) continue;
  const [, language, namespace] = match;
  (resources[language!] ??= {})[namespace!] = data;
}

// The language a person picked, else the browser's, else English.
function initialLanguage(): LanguageCode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && LANGUAGES.some((l) => l.code === saved)) return saved as LanguageCode;
  } catch {
    // storage blocked: fall through to the browser language
  }
  return navigator.language.toLowerCase().startsWith('id') ? 'id' : 'en';
}

void i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage(),
  fallbackLng: 'en',
  defaultNS: 'common',
  interpolation: { escapeValue: false },
});
document.documentElement.lang = i18n.language;

export function setLanguage(code: LanguageCode) {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // the choice then lasts until the page is closed
  }
  document.documentElement.lang = code;
  void i18n.changeLanguage(code);
}

export { i18n, useTranslation };
