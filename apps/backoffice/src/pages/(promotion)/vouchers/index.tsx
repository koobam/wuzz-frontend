import { Link } from '@tanstack/react-router';
import { Send, Ticket } from 'lucide-react';
import { buttonVariants, EmptyState, ErrorText, Page, ServerTable } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import { ActivityButton } from '@/features/activity';
import { VouchersFilters } from '@/features/vouchers/components/vouchers-filters';
import { VouchersLegend } from '@/features/vouchers/components/vouchers-legend';
import { useVouchersPage } from '@/features/vouchers/hooks/use-vouchers-page';

export function VouchersPage() {
  const { t } = useTranslation();
  const c = useVouchersPage();

  return (
    <Page
      title={t('vouchers.title')}
      subtitle={t('vouchers.subtitle')}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <ActivityButton entityType="voucher" />
          <Link to="/voucher-injections" className={`${buttonVariants({ variant: 'outline' })} inline-flex items-center gap-2`}>
            <Send className="size-4" aria-hidden /> {t('vouchers.sendAction')}
          </Link>
          <Link to="/vouchers/new" className={buttonVariants({ variant: 'primary' })}>{t('vouchers.add')}</Link>
        </div>
      }
    >
      <ErrorText error={c.error} />
      <ServerTable
        state={c.table}
        data={c.rows}
        total={c.total}
        ready={c.ready}
        columns={c.columns}
        rowId={(v) => String(v.id)}
        labels={c.labels}
        filters={<VouchersFilters {...c.filters} />}
        legend={<VouchersLegend />}
        emptyState={
          <EmptyState icon={Ticket} title={t('vouchers.emptyTitle')} description={t('vouchers.emptyDescription')}>
            <Link to="/vouchers/new" className={buttonVariants({ variant: 'primary' })}>{t('vouchers.add')}</Link>
          </EmptyState>
        }
      />
    </Page>
  );
}
