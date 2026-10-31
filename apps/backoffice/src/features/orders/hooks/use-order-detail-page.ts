import { useParams } from '@tanstack/react-router';
import { useTranslation } from '@/core/utils/i18n';
import { useMoveOrder, useOrder, useOutlets, useServices } from '@/services/hooks/apis';
import { useConfirmAction } from '@/services/hooks/use-confirm-action';
import { NEXT } from '../utils/status';

/** Everything the order page needs: the order, its names (outlet, icons), how to write a time, and the moves open to it. */
export function useOrderDetailPage() {
  const { id } = useParams({ from: '/_authed/orders_/$id' });
  const { i18n } = useTranslation();
  const order = useOrder(id);
  const services = useServices();
  const outlets = useOutlets();
  const move = useMoveOrder();
  const ask = useConfirmAction();

  const o = order.data;
  return {
    order: o,
    isMissing: order.isError && !o,
    error: order.error ?? move.error,
    moves: o ? (NEXT[o.status] ?? []) : [],
    moving: move.isPending,
    move: async (to: NonNullable<typeof NEXT[keyof typeof NEXT]>[number]) => {
      if (o && to !== 'created' && (await ask.moveOrder(o.code, to))) move.mutate({ id, to });
    },
    outletName: o ? (outlets.data?.find((x) => x.id === o.outlet_id)?.name ?? `#${o.outlet_id}`) : '',
    iconOf: (itemId: number) => services.data?.find((s) => s.id === itemId)?.icon ?? '',
    when: (iso: string) => new Date(iso).toLocaleString(i18n.language, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
  };
}
