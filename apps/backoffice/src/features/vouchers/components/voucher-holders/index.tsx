import { Ticket } from 'lucide-react';
import { EmptyState, ServerTable } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import { useTableLabels } from '@/services/hooks/use-table-labels';
import { useHoldersColumns } from '../../hooks/use-holders-columns';
import type { useVoucherDetailPage } from '../../hooks/use-voucher-detail-page';

/** The customers who hold a voucher, searched by name or phone and paged by the server. */
export function VoucherHolders({ holders, usageLimit }: { holders: ReturnType<typeof useVoucherDetailPage>['holders']; usageLimit: number }) {
  const { t } = useTranslation();
  const columns = useHoldersColumns(usageLimit);
  const labels = useTableLabels({ search: 'vouchers.holders.search', showing: 'vouchers.holders.showing' });
  return (
    <section className="space-y-3">
      <div className="space-y-0.5">
        <h2 className="text-sm font-semibold">{t('vouchers.holders.title')}</h2>
        <p className="text-xs text-muted-foreground">{t('vouchers.holders.description')}</p>
      </div>
      <ServerTable
        state={holders.table}
        data={holders.rows}
        total={holders.total}
        ready={holders.ready}
        columns={columns}
        rowId={(h) => String(h.id)}
        labels={labels}
        emptyState={<EmptyState icon={Ticket} title={t('vouchers.holders.emptyTitle')} description={t('vouchers.holders.emptyDescription')} />}
      />
    </section>
  );
}
