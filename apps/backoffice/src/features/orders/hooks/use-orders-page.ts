import { type DayRange, useServerTable } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import { useMoveOrder, useOrders, useOrderSummary, useOutlets, useServices } from '@/services/hooks/apis';
import { useConfirmAction } from '@/services/hooks/use-confirm-action';
import { useTableLabels } from '@/services/hooks/use-table-labels';
import { ordersFiltersSchema } from '../utils/orders-filters.schema';
import { ORDER_STATUSES } from '../utils/status';
import { useOrdersColumns } from './use-orders-columns';

/** Everything the orders page does: the table and its filters, the summary, the date range and the moves of a row. */
export function useOrdersPage() {
  const { t } = useTranslation();
  // The date range is two filters (from, to), both empty for every order; the server takes up to a year.
  const table = useServerTable({ defaultSort: { id: 'created_at', desc: true }, schema: ordersFiltersSchema });
  const { status, outlet, from, to } = table.filters;

  const orders = useOrders({ ...table.params, status, outlet_id: outlet || undefined, from, to });
  const summary = useOrderSummary({ status, outlet_id: outlet || undefined, q: table.q, from, to });
  const outlets = useOutlets();
  const services = useServices();
  const move = useMoveOrder();
  const ask = useConfirmAction();
  const labels = useTableLabels({ search: 'orders.search', showing: 'orders.showing' });
  const columns = useOrdersColumns({
    outlets: outlets.data,
    services: services.data,
    moving: move.isPending,
    onMove: async (o, to) => {
      if (to !== 'created' && (await ask.moveOrder(o.code, to))) move.mutate({ id: o.id, to });
    },
  });

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
    table,
    labels,
    columns,
    orders,
    summary: summary.data,
    error: orders.error ?? outlets.error ?? move.error,
    range,
    setRange,
    clearRange,
    status,
    outlet,
    statusOptions: [{ value: '', label: t('status.all') }, ...ORDER_STATUSES.map((s) => ({ value: s as string, label: t(`status.order.${s}`) }))],
    outletOptions: [{ value: 0, label: t('orders.allOutlets') }, ...(outlets.data ?? []).map((o) => ({ value: o.id, label: o.name }))],
  };
}
