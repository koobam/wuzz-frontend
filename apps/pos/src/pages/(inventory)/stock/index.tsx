import { DataTable, ErrorText, Page } from '@wuzz/web-ui';
import { Pager } from '@/features/stock/components/pager';
import { StockDialog } from '@/features/stock/components/stock-dialog';
import { StockTabs } from '@/features/stock/components/stock-tabs';
import { StockToolbar } from '@/features/stock/components/stock-toolbar';
import { useStockPage } from '@/features/stock/hooks/use-stock-page';
import { useTranslation } from '@/core/utils/i18n';
import { HistoryLegend } from '@/features/stock/components/history-legend';
import { StockLegend } from '@/features/stock/components/stock-legend';

export function StockPage() {
  const { t } = useTranslation();
  const c = useStockPage();
  return (
    <Page title={t('stock.title')} subtitle={t('stock.subtitle')}>
      <StockTabs value={c.tab} onChange={c.setTab} />
      <ErrorText error={c.error} />
      {c.tab === 'stock' ? (
        <DataTable
          toolbar={<StockToolbar table={c.table} />}
          footer={<StockLegend />}
          data={c.stock.data?.items ?? []}
          columns={c.stockColumns}
          rowId={(r) => String(r.material_id)}
          empty={c.stock.data && c.stock.data.items.length === 0 ? (c.filtered ? t('stock.noMatch') : t('stock.empty')) : undefined}
        />
      ) : (
        <DataTable footer={<HistoryLegend />} data={c.history.data?.items ?? []} columns={c.movementColumns} rowId={(m) => String(m.id)} empty={c.history.data && c.history.data.items.length === 0 ? t('stock.empty') : undefined} />
      )}
      <Pager prev={c.prev} next={c.next} />
      {c.acting && <StockDialog action={c.acting.action} row={c.acting.row} onClose={c.closeDialog} onDone={c.closeDialog} />}
    </Page>
  );
}
