import { useCallback, useState } from 'react';
import { useServerTable } from '@wuzz/web-ui';
import type { StockRow } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { useOutlets, useStock, useStockLowCount } from '@/services/hooks/apis';
import { useTableLabels } from '@/services/hooks/use-table-labels';
import type { StockAction } from '../utils/stock-dialog.schema';
import { useStockColumns } from './use-stock-columns';
import { stockFiltersSchema } from '../utils/stock-filters.schema';

/** What is in stock at each outlet and the actions that change it: the table, its filters, and the action sheet that is open. */
export function useStockPage() {
  const { t } = useTranslation();
  const outlets = useOutlets();
  // Resting on the first outlet, so every material shows (with 0 where nothing has been recorded yet): outlet 0 means "the first one",
  // and -1 means every outlet.
  const table = useServerTable({ defaultSort: { id: 'sku' }, schema: stockFiltersSchema });
  const outlet = table.filters.outlet === 0 ? (outlets.data?.[0]?.id ?? 0) : table.filters.outlet;
  const outletId = outlet > 0 ? outlet : undefined;
  const [acting, setActing] = useState<{ action: StockAction; row: StockRow } | null>(null);
  const labels = useTableLabels({ search: 'stock.search', showing: 'stock.showing' });

  const stock = useStock({ ...table.params, outlet_id: outletId, low: table.filters.low ? 'true' : '' }, { enabled: outlets.isSuccess });
  // How many materials are running low here (whatever the other filters say), shown on the toggle.
  const lowCount = useStockLowCount(outletId, { enabled: outlets.isSuccess });

  const onAct = useCallback((action: StockAction, row: StockRow) => setActing({ action, row }), []);
  const columns = useStockColumns({ outlet, outlets: outlets.data, onAct });

  return {
    t,
    table,
    labels,
    columns,
    outlet,
    outlets: outlets.data ?? [],
    stock: { rows: stock.data?.items ?? [], total: stock.data?.total ?? 0, ready: !!stock.data },
    lowCount: lowCount.data ?? 0,
    error: stock.error ?? outlets.error,
    acting,
    closeSheet: () => setActing(null),
  };
}
