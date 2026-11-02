import { createQueryKeys } from '@lukemorales/query-key-factory';
import { listMovements, listStock } from '@/core/api';
import type { MovementQuery, StockQuery } from '@/core/api';

export const stockQueries = createQueryKeys('stock', {
  list: (params: StockQuery) => ({
    queryKey: [params],
    queryFn: ({ signal }) => listStock(params, signal),
  }),
  movements: (params: MovementQuery) => ({
    queryKey: [params],
    queryFn: ({ signal }) => listMovements(params, signal),
  }),
});
