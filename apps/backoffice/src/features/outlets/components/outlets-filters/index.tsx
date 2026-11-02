import { FilterField, Select } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';

type Active = '' | 'true' | 'false';

/** The outlet list's filter on whether an outlet is open for business. */
export function OutletsFilters({ active, onActive }: { active: Active; onActive: (v: Active) => void }) {
  const { t } = useTranslation();
  return (
    <FilterField label={t('filter.status')}>
    <Select
      ariaLabel={t('filter.status')}
      className="w-full"
      value={active}
      onChange={onActive}
      options={[
        { value: '' as const, label: t('status.allShort') },
        { value: 'true' as const, label: t('status.record.active') },
        { value: 'false' as const, label: t('status.record.inactive') },
      ]}
    />
    </FilterField>
  );
}
