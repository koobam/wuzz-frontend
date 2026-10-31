import { Link } from '@tanstack/react-router';
import { Power, PowerOff, Send } from 'lucide-react';
import { Button, buttonVariants, ErrorText, Page } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import { ActivityButton } from '@/features/activity';
import { PageNav } from '@/features/shell';
import { VoucherDetail } from '@/features/vouchers/components/voucher-detail';
import { VoucherHolders } from '@/features/vouchers/components/voucher-holders';
import { useVoucherDetailPage } from '@/features/vouchers/hooks/use-voucher-detail-page';

/** One voucher in full, read-only, with the customers who hold it; the Edit button opens the form. */
export function VoucherDetailPage() {
  const { t } = useTranslation();
  const c = useVoucherDetailPage();

  return (
    <Page
      title={c.voucher?.title ?? t('vouchers.detail.title')}
      subtitle={t('vouchers.detail.subtitle')}
      nav={<PageNav back={{ to: '/vouchers' }} backLabel={t('vouchers.title')} trail={[{ label: t('vouchers.title'), to: '/vouchers' }]} current={c.voucher?.title ?? t('vouchers.detail.title')} />}
      actions={
        c.voucher && (
          <div className="flex flex-wrap items-center gap-2">
            <ActivityButton entityType="voucher" entityId={c.voucher.id} />
            <Button className="inline-flex items-center gap-2" onClick={c.onSend}>
              <Send className="size-4" aria-hidden /> {t('vouchers.sendAction')}
            </Button>
            <Button className="inline-flex items-center gap-2" disabled={c.busy} onClick={() => void c.onToggle()}>
              {c.voucher.status === 'active' ? <PowerOff className="size-4" aria-hidden /> : <Power className="size-4" aria-hidden />}
              {t(`toggle.${c.voucher.status === 'active' ? 'off' : 'on'}`)}
            </Button>
            <Button className="text-destructive hover:bg-destructive/10" disabled={c.busy} onClick={() => void c.onDelete()}>{t('common.delete')}</Button>
            <Link to="/vouchers/$id/edit" params={{ id: String(c.voucher.id) }} className={buttonVariants({ variant: 'primary' })}>{t('common.edit')}</Link>
          </div>
        )
      }
    >
      <ErrorText error={c.error} />
      {c.loading && <p className="text-sm text-muted-foreground">{t('vouchers.detail.loading')}</p>}
      {c.isMissing && <p className="rounded-3xl border border-border bg-card p-5 text-sm text-muted-foreground">{t('vouchers.detail.notFound')}</p>}
      {c.voucher && (
        <div className="space-y-8">
          <VoucherDetail voucher={c.voucher} />
          <VoucherHolders holders={c.holders} usageLimit={c.voucher.usage_limit} />
        </div>
      )}
    </Page>
  );
}
