import { Link } from '@tanstack/react-router';
import { buttonVariants, Page } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import { ActivityButton } from '@/features/activity';
import { PageNav } from '@/features/shell';
import { InjectionHistory } from '@/features/vouchers/components/injection-history';
import { VoucherSend } from '@/features/vouchers/components/voucher-send';
import { useVoucherInjectionsPage } from '@/features/vouchers/hooks/use-voucher-injections-page';

/** Send a voucher to customers: pick the voucher and the people, confirm, and see what came of it; below, the history of sends. */
export function VoucherInjectionsPage() {
  const { t } = useTranslation();
  const c = useVoucherInjectionsPage();

  return (
    <Page
      title={t('vouchers.send.title')}
      subtitle={t('vouchers.send.subtitle')}
      nav={<PageNav back={{ to: '/vouchers' }} backLabel={t('vouchers.title')} trail={[{ label: t('vouchers.title'), to: '/vouchers' }]} current={t('vouchers.send.title')} />}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <ActivityButton entityType="voucher" />
          <Link to="/vouchers" className={buttonVariants({ variant: 'outline' })}>{t('vouchers.title')}</Link>
        </div>
      }
    >
      <div className="space-y-8">
        <VoucherSend send={c.send} />
        <InjectionHistory history={c.history} vouchers={c.send.vouchers} />
      </div>
    </Page>
  );
}
