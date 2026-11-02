import { createQueryKeys } from '@lukemorales/query-key-factory';
import { getOrder, getOrderSummary, listOrders, orderStats } from '@/core/api';
import type { OrderFilter, OrdersParams } from '@/core/api';

/** Every read of orders, keyed the same way the mutations invalidate them (`queries.orders._def`). */
export const ordersQueries = createQueryKeys('orders', {
  list: (params: OrdersParams) => ({
    queryKey: [params],
    queryFn: ({ signal }) => listOrders(params, signal),
  }),
  summary: (filter: OrderFilter) => ({
    queryKey: [filter],
    queryFn: ({ signal }) => getOrderSummary(filter, signal),
  }),
  detail: (id: string) => ({
    queryKey: [id],
    queryFn: ({ signal }) => getOrder(id, signal),
  }),
  stats: (range: { from: string; to: string }) => ({
    queryKey: [range],
    queryFn: ({ signal }) => orderStats(range, signal),
  }),
});
