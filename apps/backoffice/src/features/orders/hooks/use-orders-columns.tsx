import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { actionsColumn, Badge, RowActions, rupiah, TrxId } from '@wuzz/web-ui';
import type { Order, OrderStatus, Outlet, Service } from '@/core/api';
import { linkAction } from '@/core/utils/link-action';
import { useTranslation } from '@/core/utils/i18n';
import { OrderItems } from '../components/order-items';
import { ACTION_ICON, NEXT, tone } from '../utils/status';

/** The columns of the orders table: what each shows, and the moves a row offers. */
export function useOrdersColumns({ outlets, services, moving, onMove }: { outlets?: Outlet[]; services?: Service[]; moving: boolean; onMove: (order: Order, to: OrderStatus) => void }) {
  const { t } = useTranslation();
  return useMemo<ColumnDef<Order>[]>(
    () => [
      { accessorKey: 'code', header: t('orders.columns.trx'), cell: ({ row }) => <TrxId code={row.original.code} /> },
      {
        accessorKey: 'customer_name',
        header: t('orders.columns.customer'),
        cell: ({ row }) => (
          <>
            {row.original.customer_name}
            <div className="text-xs text-muted-foreground">{row.original.customer_phone}</div>
          </>
        ),
      },
      {
        accessorKey: 'outlet_id',
        header: t('orders.columns.outlet'),
        cell: ({ row }) => {
          const name = outlets?.find((o) => o.id === row.original.outlet_id)?.name;
          return name ? `#${row.original.outlet_id} - ${name}` : `#${row.original.outlet_id}`;
        },
        meta: { className: 'whitespace-nowrap' },
      },
      { id: 'items', enableSorting: false, header: t('orders.columns.items'), cell: ({ row }) => <OrderItems lines={row.original.lines} services={services} names /> },
      { accessorKey: 'total', header: t('orders.columns.total'), cell: ({ row }) => rupiah(row.original.total), meta: { className: 'whitespace-nowrap' } },
      {
        accessorKey: 'status',
        header: t('orders.columns.status'),
        cell: ({ row }) => (
          <Badge tone={tone(row.original.status)} help={t(`status.help.order.${row.original.status}`)}>
            {t(`status.order.${row.original.status}`)}
          </Badge>
        ),
      },
      {
        accessorKey: 'created_at',
        header: t('orders.columns.created'),
        cell: ({ row }) => new Date(row.original.created_at).toLocaleString('id-ID'),
        meta: { className: 'whitespace-nowrap text-xs' },
      },
      actionsColumn<Order>({
        header: t('common.actions'),
        cell: (o) => (
          <RowActions
            view={{ label: t('common.viewName', { name: o.code }), link: linkAction('/orders/$id', { id: o.id }) }}
            extra={(NEXT[o.status] ?? []).map((to) => {
              const Icon = ACTION_ICON[to];
              return { label: t(`orders.action.${to}`), icon: <Icon className="size-4" aria-hidden />, danger: to === 'cancelled', disabled: moving, onClick: () => onMove(o, to) };
            })}
          />
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, services, outlets, moving],
  );
}
