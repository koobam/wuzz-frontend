import { ID, US } from 'country-flag-icons/react/3x2';
import { Select } from '@/components/select';
import { LANGUAGES, setLanguage, useTranslation, type LanguageCode } from '@/core/i18n';

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
