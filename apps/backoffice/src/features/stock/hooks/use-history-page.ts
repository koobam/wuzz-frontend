import { type DayRange, useServerTable } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import { useMovements, useOutlets } from '@/services/hooks/apis';
import { useTableLabels } from '@/services/hooks/use-table-labels';
import { useHistoryColumns } from './use-history-columns';
import { historyFiltersSchema } from '../utils/history-filters.schema';

/** The stock ledger: every movement, newest first, narrowed by outlet, kind and a range of days. */
export function useHistoryPage() {
  const { t } = useTranslation();
  const outlets = useOutlets();
  const table = useServerTable({ defaultSort: { id: 'created_at', desc: true }, schema: historyFiltersSchema });
  const { outlet, kind, from, to } = table.filters;
  const labels = useTableLabels({ search: 'history.search', showing: 'history.showing' });
  const list = useMovements({ ...table.params, outlet_id: outlet || undefined, kind, from, to });
  const columns = useHistoryColumns({ outlet, outlets: outlets.data });

  const range: DayRange | null = from && to ? { from, to } : null;
  const setRange = (r: DayRange) => {
    table.setFilter('from', r.from);
    table.setFilter('to', r.to);
  };
  const clearRange = () => {
    table.setFilter('from', '');
    table.setFilter('to', '');
  };

  return {
    t,
    table,
    labels,
    columns,
    outlet,
    kind,
    outlets: outlets.data ?? [],
    range,
    setRange,
    clearRange,
    list: { rows: list.data?.items ?? [], total: list.data?.total ?? 0, ready: !!list.data },
    error: list.error ?? outlets.error,
  };
}
