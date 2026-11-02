import { ErrorText, Page } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import { FormActionsProvider, PageNav, TopFormActions } from '@/features/shell';
import { VoucherForm } from '@/features/vouchers/components/voucher-form';
import { useVoucherFormPage } from '@/features/vouchers/hooks/use-voucher-form-page';

/** The page that makes a voucher, or edits the one in the address. */
export function VoucherFormPage() {
  const { t } = useTranslation();
  const c = useVoucherFormPage();
  const title = c.editing ? t('vouchers.form.editTitle') : t('vouchers.form.createTitle');

  return (
    <FormActionsProvider>
      <Page
        actions={<TopFormActions />}
        title={title}
        subtitle={c.editing ? t('vouchers.form.editSubtitle') : t('vouchers.form.createSubtitle')}
        nav={
          <PageNav
            back={c.editing && c.voucher ? { to: '/vouchers/$id', params: { id: String(c.voucher.id) } } : { to: '/vouchers' }}
            backLabel={c.editing && c.voucher ? c.voucher.title : t('vouchers.title')}
            trail={[
              { label: t('vouchers.title'), to: '/vouchers' },
              ...(c.editing && c.voucher ? [{ label: c.voucher.title, to: '/vouchers/$id', params: { id: String(c.voucher.id) } }] : []),
            ]}
            current={title}
          />
        }
      >
        <ErrorText error={c.error} />
        {c.loading && <p className="text-sm text-muted-foreground">{t('vouchers.detail.loading')}</p>}
        {c.isMissing && <p className="rounded-3xl border border-border bg-card p-5 text-sm text-muted-foreground">{t('vouchers.detail.notFound')}</p>}
        {!c.loading && !c.isMissing && !c.error && <VoucherForm key={c.voucher?.id ?? 'new'} voucher={c.voucher} onSaved={c.onSaved} onCancel={c.onCancel} />}
      </Page>
    </FormActionsProvider>
  );
}
