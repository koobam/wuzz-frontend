import { Badge, TrxId } from '@wuzz/web-ui';
import type { Order } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { tone } from '../../utils/status';

/** Who, where and when: the facts of an order that are not its lines. */
export function OrderSummary({ order: o, outletName, when }: { order: Order; outletName: string; when: (iso: string) => string }) {
  const { t } = useTranslation();
  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
  return (
    <aside className="space-y-4 rounded-3xl border border-border bg-card p-5 text-sm">
      <h2 className="text-sm font-semibold">{t('orders.detail.summary')}</h2>
      <dl className="space-y-4">
        <Row label={t('orders.columns.trx')}><TrxId code={o.code} /></Row>
        <Row label={t('orders.detail.status')}>
          <Badge tone={tone(o.status)} help={t(`status.help.order.${o.status}`)}>{t(`status.order.${o.status}`)}</Badge>
        </Row>
        <Row label={t('orders.detail.customer')}>
          {o.customer_name}
          {o.customer_phone && <div className="text-xs text-muted-foreground">{o.customer_phone}</div>}
        </Row>
        <Row label={t('orders.detail.outlet')}>{outletName}</Row>
        <Row label={t('orders.detail.created')}>{when(o.created_at)}</Row>
        <Row label={t('orders.detail.updated')}>{when(o.updated_at)}</Row>
        <Row label={t('orders.detail.by')}>{o.created_by || '–'}</Row>
      </dl>
    </aside>
  );
}
