import { Link } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import { Badge, Input, rupiah, Select, Table, Td, TrxId } from '@wuzz/web-ui';
import type { Order, Service } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { OrderItems } from '@/features/orders/components/order-items';
import { OrdersLegend } from '@/features/orders/components/orders-legend';
import { ORDER_STATUSES, tone } from '@/features/orders/utils/status';

/** The latest orders, with a search and a status filter, and a button to all of them floating over the foot of the card. */
export function RecentOrders({ rows, services, search, onSearch, status, onStatus }: { rows: Order[]; services?: Service[]; search: string; onSearch: (v: string) => void; status: string; onStatus: (v: string) => void }) {
  const { t } = useTranslation();
  return (
    <section className="relative flex min-h-0 flex-col rounded-3xl border border-border bg-card p-5 xl:col-span-2">
      <div className="mb-4 flex shrink-0 flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{t('dashboard.recent')}</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input shape="pill" className="w-48 pl-9" placeholder={t('dashboard.search')} value={search} onChange={(e) => onSearch(e.target.value)} />
          </div>
          <Select
            className="w-40"
            ariaLabel={t('dashboard.recent')}
            value={status}
            onChange={onStatus}
            options={[{ value: '', label: t('status.all') }, ...ORDER_STATUSES.map((s) => ({ value: s as string, label: t(`status.order.${s}`) }))]}
          />
        </div>
      </div>
      <Table
        footer={<OrdersLegend />}
        flat
        head={[t('orders.columns.trx'), t('orders.columns.customer'), t('orders.columns.items'), t('orders.columns.total'), t('orders.columns.status'), t('orders.columns.created')]}
        empty={rows.length === 0 ? t('orders.empty') : undefined}
      >
        {rows.map((o) => (
          <tr key={o.id}>
            <Td><TrxId code={o.code} /></Td>
            <Td>{o.customer_name}</Td>
            <Td><OrderItems lines={o.lines} services={services} names /></Td>
            <Td>{rupiah(o.total)}</Td>
            <Td><Badge tone={tone(o.status)} help={t(`status.help.order.${o.status}`)}>{t(`status.order.${o.status}`)}</Badge></Td>
            <Td className="whitespace-nowrap text-xs">{new Date(o.created_at).toLocaleString('id-ID')}</Td>
          </tr>
        ))}
        {/* Room under the last row so it can scroll clear of the floating button. */}
        {rows.length > 0 && (
          <tr aria-hidden>
            <td colSpan={6} className="h-16" />
          </tr>
        )}
      </Table>
      {/* Floats over the foot of the card; the fade keeps rows behind it from fighting the label. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center rounded-b-3xl bg-linear-to-t from-card via-card/90 to-transparent px-5 pt-10 pb-5">
        <Link to="/orders" className="pointer-events-auto rounded-full border border-border bg-card px-5 py-2 text-sm font-medium hover:bg-accent">
          {t('dashboard.viewMore')}
        </Link>
      </div>
    </section>
  );
}
