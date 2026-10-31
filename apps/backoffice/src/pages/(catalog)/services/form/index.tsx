import { ErrorText, Page } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import { FormActionsProvider, PageNav, TopFormActions } from '@/features/shell';
import { ServiceForm } from '@/features/services/components/service-form';
import { useServiceFormPage } from '@/features/services/hooks/use-service-form-page';

/** The page that makes a service, or edits the one in the address. */
export function ServiceFormPage() {
  const { t } = useTranslation();
  const c = useServiceFormPage();

  return (
    <FormActionsProvider>
    <Page
      actions={<TopFormActions />}
      title={c.editing ? t('services.form.editTitle') : t('services.form.createTitle')}
      subtitle={c.editing ? t('services.form.editSubtitle') : t('services.form.createSubtitle')}
      nav={
        <PageNav
          back={c.editing && c.service ? { to: '/services/$id', params: { id: String(c.service.id) } } : { to: '/services' }}
          backLabel={c.editing && c.service ? c.service.name : t('services.title')}
          trail={[
            { label: t('services.title'), to: '/services' },
            ...(c.editing && c.service ? [{ label: c.service.name, to: '/services/$id', params: { id: String(c.service.id) } }] : []),
          ]}
          current={c.editing ? t('services.form.editTitle') : t('services.form.createTitle')}
        />
      }
    >
      <ErrorText error={c.error} />
      {c.loading && <p className="text-sm text-muted-foreground">{t('services.detail.loading')}</p>}
      {c.isMissing && <p className="rounded-3xl border border-border bg-card p-5 text-sm text-muted-foreground">{t('services.detail.notFound')}</p>}
      {!c.loading && !c.isMissing && <ServiceForm key={c.service?.id ?? 'new'} service={c.service} onSaved={c.onSaved} onCancel={c.onCancel} />}
    </Page>
    </FormActionsProvider>
  );
}
