import { ErrorText, Page } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import { BannerForm } from '@/features/banners/components/banner-form';
import { useBannerFormPage } from '@/features/banners/hooks/use-banner-form-page';
import { FormActionsProvider, PageNav, TopFormActions } from '@/features/shell';

/** The page that makes a banner, or edits the one in the address. */
export function BannerFormPage() {
  const { t } = useTranslation();
  const c = useBannerFormPage();
  const title = c.editing ? t('banners.form.editTitle') : t('banners.form.createTitle');

  return (
    <FormActionsProvider>
      <Page
        actions={<TopFormActions />}
        title={title}
        subtitle={c.editing ? t('banners.form.editSubtitle') : t('banners.form.createSubtitle')}
        nav={
          <PageNav
            back={c.editing && c.banner ? { to: '/banners/$id', params: { id: String(c.banner.id) } } : { to: '/banners' }}
            backLabel={c.editing && c.banner ? c.banner.title : t('banners.title')}
            trail={[
              { label: t('banners.title'), to: '/banners' },
              ...(c.editing && c.banner ? [{ label: c.banner.title, to: '/banners/$id', params: { id: String(c.banner.id) } }] : []),
            ]}
            current={title}
          />
        }
      >
        <ErrorText error={c.error} />
        {c.loading && <p className="text-sm text-muted-foreground">{t('banners.detail.loading')}</p>}
        {c.isMissing && <p className="rounded-3xl border border-border bg-card p-5 text-sm text-muted-foreground">{t('banners.detail.notFound')}</p>}
        {!c.loading && !c.isMissing && !c.error && <BannerForm key={c.banner?.id ?? 'new'} banner={c.banner} onSaved={c.onSaved} onCancel={c.onCancel} />}
      </Page>
    </FormActionsProvider>
  );
}
