import { DataTable, ErrorText, Page } from '@wuzz/web-ui';
import { OrdersLegend } from '@/features/orders/components/orders-legend';
import { useOrdersPage } from '@/features/orders/hooks/use-orders-page';
import { useTranslation } from '@/core/utils/i18n';

export function OrdersPage() {
  const { t } = useTranslation();
  const c = useOrdersPage();
  return (
    <Page title={t('orders.title')} subtitle={t('orders.subtitle')}>
      <ErrorText error={c.error} />
      <DataTable footer={<OrdersLegend />} data={c.orders} columns={c.columns} rowId={(o) => o.id} empty={c.orders.length === 0 ? t('orders.empty') : undefined} />
    </Page>
  );
}
