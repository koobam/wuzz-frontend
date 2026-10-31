import { ID, US } from 'country-flag-icons/react/3x2';
import { LANGUAGES, setLanguage, useTranslation } from '@/core/i18n';

// A language is not a country; these are the flags the switch shows for them.
const FLAGS = { US, ID } as const;

/** Two tabs side by side; the current language is the filled one. */
export function LanguageSwitch() {
  const { t, i18n } = useTranslation();
  return (
    <div role="tablist" aria-label={t('language.label')} className="cs-lang">
      {LANGUAGES.map((l) => {
        const Flag = FLAGS[l.country];
        return (
          <button key={l.code} type="button" role="tab" aria-selected={i18n.language === l.code} aria-label={l.label} onClick={() => setLanguage(l.code)}>
            <Flag aria-hidden />
            {l.code.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
