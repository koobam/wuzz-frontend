import { Link } from '@tanstack/react-router';
import { ClipboardList } from 'lucide-react';
import { Button, buttonVariants, DateRangePicker, EmptyState, ErrorText, FilterField, Page, Select, ServerTable } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import { SummaryCards } from '@/features/orders/components/summary-cards';
import { useOrdersPage } from '@/features/orders/hooks/use-orders-page';
import { ActivityButton } from '@/features/activity';
import { OrdersLegend } from '@/features/orders/components/orders-legend';

export function OrdersPage() {
  const { t } = useTranslation();
  const c = useOrdersPage();

  return (
    <Page
      title={t('orders.title')}
      subtitle={t('orders.subtitle')}
      actions={<div className="flex flex-wrap items-center gap-2"><ActivityButton entityType="order" /><DateRangePicker value={c.range} onChange={c.setRange} onClear={c.clearRange} maxDays={366} /></div>}
    >
      <ErrorText error={c.error} />
      <SummaryCards summary={c.summary} />
      <ServerTable
        state={c.table}
        data={c.orders.data?.items ?? []}
        total={c.orders.data?.total ?? 0}
        ready={!!c.orders.data}
        columns={c.columns}
        rowId={(o) => o.id}
        labels={c.labels}
        filters={
          <>
            <FilterField label={t('filter.status')}><Select ariaLabel={t('filter.status')} className="w-full" value={c.status} onChange={(v) => c.table.setFilter('status', v)} options={c.statusOptions} /></FilterField>
            <FilterField label={t('filter.outlet')}><Select ariaLabel={t('filter.outlet')} className="w-full" value={c.outlet} onChange={(v) => c.table.setFilter('outlet', v)} options={c.outletOptions} /></FilterField>
          </>
        }
        legend={<OrdersLegend />}
        emptyState={
          <EmptyState icon={ClipboardList} title={t('orders.emptyTitle')} description={t('orders.emptyDescription')}>
            <Button onClick={() => void c.orders.refetch()}>{t('orders.refresh')}</Button>
            <Link to="/" className={buttonVariants()}>{t('orders.seeDashboard')}</Link>
          </EmptyState>
        }
      />
    </Page>
  );
}
