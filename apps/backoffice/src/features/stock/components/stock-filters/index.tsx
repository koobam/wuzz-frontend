import { FilterField, Select } from '@wuzz/web-ui';
import type { Outlet } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';

/** The filters over the stock table: the outlet, and "only what is running low" with how many that is. */
export function StockFilters({ outlet, outlets, low, lowCount, onOutlet, onLow }: { outlet: number; outlets: Outlet[]; low: boolean; lowCount: number; onOutlet: (id: number) => void; onLow: (low: boolean) => void }) {
  const { t } = useTranslation();
  return (
    <>
      <FilterField label={t('filter.outlet')}>
      <Select
        ariaLabel={t('filter.outlet')}
        className="w-full"
        value={outlet}
        onChange={onOutlet}
        options={[{ value: -1, label: t('stock.allOutlets') }, ...outlets.map((o) => ({ value: o.id, label: o.name }))]}
      />
      </FilterField>
      <FilterField label={t('filter.stock')} className="flex-none">
      <button type="button" aria-pressed={low} onClick={() => onLow(!low)} className={`rounded-full border px-4 py-2 text-sm ${low ? 'border-transparent bg-ink text-background' : 'border-input bg-card hover:bg-accent'}`}>
        {t('stock.lowOnly')}{lowCount ? ` (${lowCount})` : ''}
      </button>
      </FilterField>
    </>
  );
}
