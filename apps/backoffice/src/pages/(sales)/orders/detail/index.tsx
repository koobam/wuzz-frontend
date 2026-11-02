import { ErrorText, Page } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import { PageNav } from '@/features/shell';
import { OrderActions } from '@/features/orders/components/order-actions';
import { OrderLines } from '@/features/orders/components/order-lines';
import { OrderSummary } from '@/features/orders/components/order-summary';
import { useOrderDetailPage } from '@/features/orders/hooks/use-order-detail-page';
import { ActivityButton } from '@/features/activity';

/** One order in full: who, where, when, each line with what was picked, the total, and the moves open to it. */
export function OrderDetailPage() {
  const { t } = useTranslation();
  const c = useOrderDetailPage();

  return (
    <Page
      title={t('orders.detail.title')}
      subtitle={t('orders.detail.subtitle')}
      nav={
        <PageNav
          back={{ to: '/orders' }}
          backLabel={t('orders.title')}
          trail={[{ label: t('orders.title'), to: '/orders' }]}
          current={c.order?.code ?? t('orders.detail.title')}
        />
      }
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {c.order && <ActivityButton entityType="order" entityId={c.order.id} />}
          <OrderActions moves={c.moves} disabled={c.moving} onMove={c.move} />
        </div>
      }
    >
      <ErrorText error={c.error} />
      {c.isMissing && <p className="rounded-3xl border border-border bg-card p-5 text-sm text-muted-foreground">{t('orders.detail.notFound')}</p>}
      {c.order && (
        <div className="grid items-start gap-5 lg:grid-cols-[1fr_22rem]">
          <OrderLines order={c.order} iconOf={c.iconOf} />
          <OrderSummary order={c.order} outletName={c.outletName} when={c.when} />
        </div>
      )}
    </Page>
  );
}
