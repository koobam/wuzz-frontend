import { Link } from '@tanstack/react-router';
import { Warehouse } from 'lucide-react';
import { buttonVariants, EmptyState, ErrorText, Page, ServerTable } from '@wuzz/web-ui';
import { StockDialog, StockFilters, StockFlow, useStockPage } from '@/features/stock';
import { ActivityButton } from '@/features/activity';
import { StockLegend } from '@/features/stock/components/stock-legend';

/** What is in stock at each outlet, what it is worth, and the actions that change it. Each action is a movement in the stock history. */
export function StockPage() {
  const c = useStockPage();
  const { t, table, stock, acting } = c;
  return (
    <Page title={t('stock.title')} subtitle={t('stock.subtitle')} actions={<ActivityButton entityType="stock" />}>
      <StockFlow />
      <ErrorText error={c.error} />
      <ServerTable
        state={table}
        data={stock.rows}
        total={stock.total}
        ready={stock.ready}
        columns={c.columns}
        rowId={(r) => `${r.outlet_id}:${r.material_id}`}
        labels={c.labels}
        filters={<StockFilters outlet={c.outlet} outlets={c.outlets} low={table.filters.low} lowCount={c.lowCount} onOutlet={(v) => table.setFilter('outlet', v)} onLow={(v) => table.setFilter('low', v)} />}
        legend={<StockLegend />}
        emptyState={
          <EmptyState icon={Warehouse} title={t('stock.emptyTitle')} description={t('stock.emptyDescription')}>
            <Link to="/materials" className={buttonVariants({ variant: 'primary' })}>{t('stock.seeMaterials')}</Link>
            <Link to="/stock-history" className={buttonVariants()}>{t('stock.seeHistory')}</Link>
          </EmptyState>
        }
      />
      {acting && <StockDialog action={acting.action} row={acting.row} onClose={c.closeSheet} onDone={c.closeSheet} />}
    </Page>
  );
}
