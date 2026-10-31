import { FilterField, Select } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';

/** The status filter shared by the customers, admins and staff lists. */
export function StatusSelect({ label, value, onChange }: { label: string; value: string; onChange: (status: string) => void }) {
  const { t } = useTranslation();
  return (
    <FilterField label={label}>
    <Select
      ariaLabel={label}
      className="w-full"
      value={value}
      onChange={onChange}
      options={[
        { value: '', label: t('status.allShort') },
        { value: 'active', label: t('status.user.active') },
        { value: 'inactive', label: t('status.user.inactive') },
        { value: 'banned', label: t('status.user.banned') },
      ]}
    />
    </FilterField>
  );
}
