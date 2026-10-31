import { Search } from 'lucide-react';
import { FilterField, Input, type ServerTableState } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import type { StockFilters } from '../../utils/stock-filters.schema';

/** The search box and the "running low" toggle above the stock list. */
export function StockToolbar({ table }: { table: ServerTableState<StockFilters> }) {
  const { t } = useTranslation();
  const low = table.filters.low;
  return (
    <>
      <FilterField label={t('filter.search')} className="min-w-48">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input shape="pill" type="search" value={table.search} onChange={(e) => table.setSearch(e.target.value)} placeholder={t('stock.search')} aria-label={t('filter.search')} maxLength={64} className="pl-10" />
        </div>
      </FilterField>
      <FilterField label={t('filter.stock')} className="flex-none">
      <button
        type="button"
        aria-pressed={low}
        onClick={() => table.setFilter('low', !low)}
        className={`rounded-full border px-4 py-2 text-sm ${low ? 'border-transparent bg-ink text-background' : 'border-input bg-card hover:bg-accent'}`}
      >
        {t('stock.lowOnly')}
      </button>
      </FilterField>
    </>
  );
}
