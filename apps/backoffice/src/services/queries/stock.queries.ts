import { createQueryKeys } from '@lukemorales/query-key-factory';
import { listMovements, listStock } from '@/core/api';
import type { MovementQuery, StockQuery } from '@/core/api';

/** Stock on hand and its history share one prefix, so a booking refreshes both (`queries.stock._def`). */
export const stockQueries = createQueryKeys('stock', {
  list: (params: StockQuery) => ({
    queryKey: [params],
    queryFn: ({ signal }) => listStock(params, signal),
  }),
  /** How many materials run low at an outlet (undefined = every outlet). */
  lowCount: (outletId: number | undefined) => ({
    queryKey: ['low-count', outletId ?? 'all'],
    queryFn: ({ signal }) => listStock({ outlet_id: outletId, low: 'true', limit: 1 }, signal).then((p) => p.total),
  }),
  movements: (params: MovementQuery) => ({
    queryKey: ['movements', params],
    queryFn: ({ signal }) => listMovements(params, signal),
  }),
});
