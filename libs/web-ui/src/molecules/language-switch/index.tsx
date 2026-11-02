import { ID, US } from 'country-flag-icons/react/3x2';
import { useTranslation } from 'react-i18next';
import { LANGUAGES, setLanguage, type LanguageCode } from '../../i18n/languages';
import { Select } from '../select';

// A language is not a country; these are the flags the picker shows for them.
const FLAGS = { US, ID } as const;

export function LanguageSwitch() {
  const { t, i18n } = useTranslation();
  return (
    <Select
      compact
      ariaLabel={t('language.label')}
      value={i18n.language as LanguageCode}
      onChange={setLanguage}
      options={LANGUAGES.map((l) => {
        const Flag = FLAGS[l.country];
        return { value: l.code, label: l.label, icon: <Flag className="h-3 w-4 rounded-[2px]" aria-hidden /> };
      })}
    />
  );
}
