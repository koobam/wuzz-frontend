import { FilterField, Select } from '@wuzz/web-ui';
import type { ServiceCategory } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';

type Unit = '' | 'kg' | 'pcs' | 'sesi' | 'unit';
type Active = '' | 'true' | 'false';

/** The service list's filters: its category, what it is priced per, and whether it is on sale. */
export function ServicesFilters({
  categories,
  category,
  unit,
  active,
  onCategory,
  onUnit,
  onActive,
}: {
  categories: ServiceCategory[];
  category: number;
  unit: Unit;
  active: Active;
  onCategory: (v: number) => void;
  onUnit: (v: Unit) => void;
  onActive: (v: Active) => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      <FilterField label={t('filter.category')}>
      <Select
        ariaLabel={t('filter.category')}
        className="w-full"
        value={category}
        onChange={onCategory}
        options={[{ value: 0, label: t('services.allCategories') }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
      />
      </FilterField>
      <FilterField label={t('filter.unit')}>
      <Select
        ariaLabel={t('filter.unit')}
        className="w-full"
        value={unit}
        onChange={onUnit}
        options={[
          { value: '' as const, label: t('services.allUnits') },
          ...(['kg', 'pcs', 'sesi', 'unit'] as const).map((u) => ({ value: u, label: t(`unit.${u}`) })),
        ]}
      />
      </FilterField>
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
    </>
  );
}
