import { useCallback, useState } from 'react';
import { useServerTable } from '@wuzz/web-ui';
import type { StockRow } from '@/core/api';
import { useOnline } from '@/core/pos/hooks';
import { useMovements, useStock } from '@/services/hooks/apis';
import { stockFiltersSchema } from '../utils/stock-filters.schema';
import { type StockAction, useMovementColumns, useStockColumns } from './use-stock-columns';

export type StockTab = 'stock' | 'history';

/**
 * This outlet's material stock, with waste and goods received, and the history of its movements. The server is the
 * book: nothing is kept offline. The search, the "running low" filter and the page are one table state; a tab starts
 * over on its first page.
 */
export function useStockPage() {
  const online = useOnline();
  const table = useServerTable({ schema: stockFiltersSchema });
  const [tab, setTabState] = useState<StockTab>('stock');
  const [acting, setActing] = useState<{ action: StockAction; row: StockRow } | null>(null);

  const stock = useStock({ q: table.q, low: table.filters.low ? 'true' : '', limit: table.pageSize, offset: table.offset }, { enabled: tab === 'stock' });
  const history = useMovements({ limit: table.pageSize, offset: table.offset }, { enabled: tab === 'history' });

  const onAct = useCallback((action: StockAction, row: StockRow) => setActing({ action, row }), []);
  const stockColumns = useStockColumns({ online, onAct });
  const movementColumns = useMovementColumns();

  const total = (tab === 'stock' ? stock.data?.total : history.data?.total) ?? 0;

  return {
    tab,
    setTab: (k: StockTab) => {
      setTabState(k);
      table.setOffset(0);
    },
    table,
    stock,
    history,
    stockColumns,
    movementColumns,
    error: stock.error ?? history.error,
    /** Why the stock list is empty: nothing matches the search/filter, or the outlet has no stock at all. */
    filtered: table.q !== '' || table.filters.low,
    prev: { disabled: table.offset === 0, onClick: () => table.setOffset(Math.max(0, table.offset - table.pageSize)) },
    next: { disabled: table.offset + table.pageSize >= total, onClick: () => table.setOffset(table.offset + table.pageSize) },
    acting,
    closeDialog: () => setActing(null),
  };
}
