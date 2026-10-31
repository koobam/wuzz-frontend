import { FilterField, Select } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';

export type Requirement = '' | 'required' | 'optional';

/** The modifier list's filter on whether a group has to be picked. */
export function RequirementFilter({ value, onChange }: { value: Requirement; onChange: (v: Requirement) => void }) {
  const { t } = useTranslation();
  return (
    <FilterField label={t('filter.rule')}>
    <Select
      ariaLabel={t('filter.rule')}
      className="w-full"
      value={value}
      onChange={onChange}
      options={[
        { value: '' as const, label: t('groups.requirementAll') },
        { value: 'required' as const, label: t('groups.requirementRequired') },
        { value: 'optional' as const, label: t('groups.requirementOptional') },
      ]}
    />
    </FilterField>
  );
}
