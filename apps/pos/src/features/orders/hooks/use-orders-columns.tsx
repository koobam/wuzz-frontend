import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { CircleCheck, PackageCheck, Play, XCircle } from 'lucide-react';
import { actionsColumn, Badge, RowActions, rupiah, TrxId } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import type { Order, OrderStatus } from '@/core/pos/types';
import { OrderItems } from '../components/order-items';
import { NEXT, statusTone } from '../utils/status';

const ACTION_ICON = { start: Play, ready: PackageCheck, pickedUp: CircleCheck, cancel: XCircle } as const;

/** The columns of the till's orders: code, customer, items, total, status and what can be done next. */
export function useOrdersColumns({ iconOf, online, onMove }: { iconOf: (itemId: number) => string; online: boolean; onMove: (o: Order, to: OrderStatus, label: string) => void | Promise<void> }) {
  const { t } = useTranslation();
  return useMemo<ColumnDef<Order>[]>(
    () => [
      { id: 'trx', header: t('orders.trx'), cell: ({ row }) => <TrxId code={row.original.code} /> },
      { id: 'customer', header: t('orders.customerHead'), cell: ({ row }) => row.original.customerName },
      { id: 'items', header: t('orders.itemsHead'), cell: ({ row }) => <OrderItems lines={row.original.lines} iconOf={iconOf} /> },
      { id: 'total', header: t('orders.total'), cell: ({ row }) => rupiah(row.original.total), meta: { className: 'whitespace-nowrap tabular-nums' } },
      {
        id: 'status',
        header: t('orders.statusHead'),
        cell: ({ row: { original: o } }) => <Badge tone={statusTone(o.status)} help={t(`orders.statusHelp.${o.status}`)}>{t(`orders.status.${o.status}`)}</Badge>,
      },
      actionsColumn<Order>({
        header: t('common.actions'),
        cell: (o) => (
          <RowActions
            extra={(NEXT[o.status] ?? []).map((a) => {
              const Icon = ACTION_ICON[a.label as keyof typeof ACTION_ICON];
              return {
                label: online ? `${t(`orders.action.${a.label}`)}: ${o.code}` : `${t(`orders.action.${a.label}`)}: ${t('orders.needsConnection')}`,
                icon: <Icon className="size-4" aria-hidden />,
                danger: a.to === 'cancelled',
                disabled: !online,
                onClick: () => void onMove(o, a.to, a.label),
              };
            })}
          />
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, iconOf, online, onMove],
  );
}
