import { Link } from '@tanstack/react-router';
import { History } from 'lucide-react';
import { buttonVariants, DateRangePicker, EmptyState, ErrorText, Page, ServerTable } from '@wuzz/web-ui';
import { HistoryFilters, useHistoryPage } from '@/features/stock';
import { ActivityButton } from '@/features/activity';
import { HistoryLegend } from '@/features/stock/components/history-legend';

/** The stock ledger: every movement, newest first. Nothing here can be edited; a correction is a new line. */
export function StockHistoryPage() {
  const c = useHistoryPage();
  const { t, table, list } = c;
  return (
    <Page
      title={t('history.title')}
      subtitle={t('history.subtitle')}
      actions={<div className="flex flex-wrap items-center gap-2"><ActivityButton entityType="stock" /><DateRangePicker value={c.range} onChange={c.setRange} onClear={c.clearRange} maxDays={366} /></div>}
    >
      <ErrorText error={c.error} />
      <ServerTable
        state={table}
        data={list.rows}
        total={list.total}
        ready={list.ready}
        columns={c.columns}
        rowId={(m) => String(m.id)}
        labels={c.labels}
        filters={<HistoryFilters outlet={c.outlet} kind={c.kind} outlets={c.outlets} onOutlet={(v) => table.setFilter('outlet', v)} onKind={(v) => table.setFilter('kind', v)} />}
        legend={<HistoryLegend />}
        emptyState={
          <EmptyState icon={History} title={t('history.emptyTitle')} description={t('history.emptyDescription')}>
            <Link to="/stock" className={buttonVariants({ variant: 'primary' })}>{t('history.seeStock')}</Link>
            <Link to="/materials" className={buttonVariants()}>{t('history.seeMaterials')}</Link>
          </EmptyState>
        }
      />
    </Page>
  );
}
