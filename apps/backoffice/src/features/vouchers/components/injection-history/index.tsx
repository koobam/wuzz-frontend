import { History } from 'lucide-react';
import { DataTable, EmptyState, ErrorText, FilterField, Pagination, ResetFilters, Select } from '@wuzz/web-ui';
import type { Voucher } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import type { useVoucherInjectionsPage } from '../../hooks/use-voucher-injections-page';

/** The history of sends, newest first: filtered by voucher and paged by the server. */
export function InjectionHistory({ history, vouchers }: { history: ReturnType<typeof useVoucherInjectionsPage>['history']; vouchers: Voucher[] }) {
  const { t } = useTranslation();
  const h = history;
  return (
    <section className="space-y-3">
      <div className="space-y-0.5">
        <h2 className="text-sm font-semibold">{t('vouchers.history.title')}</h2>
        <p className="text-xs text-muted-foreground">{t('vouchers.history.description')}</p>
      </div>
      <ErrorText error={h.error} />
      <DataTable
        toolbar={
          <>
            <FilterField label={t('vouchers.history.voucher')}>
              <Select
                ariaLabel={t('vouchers.history.voucher')}
                className="w-full"
                searchable
                value={h.voucher}
                onChange={h.onVoucher}
                options={[{ value: 0, label: t('vouchers.history.anyVoucher') }, ...vouchers.map((v) => ({ value: v.id, label: v.title }))]}
              />
            </FilterField>
            {h.table.active && <ResetFilters label={h.labels.reset} onClick={h.table.reset} />}
          </>
        }
        sorting={h.table.sorting}
        onSortingChange={h.table.setSorting}
        data={h.rows}
        columns={h.columns}
        rowId={(i) => String(i.id)}
        empty={h.ready && h.rows.length === 0 ? <EmptyState icon={History} title={t('vouchers.history.emptyTitle')} description={t('vouchers.history.emptyDescription')} /> : undefined}
      />
      <Pagination offset={h.table.offset} pageSize={h.table.pageSize} total={h.total} showing={h.labels.showing} previous={h.labels.previous} next={h.labels.next} onChange={h.table.setOffset} />
    </section>
  );
}
