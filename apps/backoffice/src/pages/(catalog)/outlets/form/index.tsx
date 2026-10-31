import { ErrorText } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import { FormActionsProvider, PageNav, TopFormActions } from '@/features/shell';
import { OutletForm } from '@/features/outlets/components/outlet-form';
import { OutletBanner } from '@/features/outlets/components/outlet-map';
import { OutletsHeader } from '@/features/outlets/components/outlets-header';
import { useOutletFormPage } from '@/features/outlets/hooks/use-outlet-form-page';

/** The page that makes a outlet, or edits the one in the address. Its title block is drawn over the bottom of the map. */
export function OutletFormPage() {
  const { t } = useTranslation();
  const c = useOutletFormPage();
  const title = c.editing ? t('outlets.detail.editTitle') : t('outlets.detail.createTitle');
  const header = (
    <OutletsHeader
      nav={
        <PageNav
          inline
          back={c.editing && c.outlet ? { to: '/outlets/$id', params: { id: String(c.outlet.id) } } : { to: '/outlets' }}
          backLabel={c.editing && c.outlet ? c.outlet.name : t('outlets.title')}
          trail={[
            { label: t('outlets.title'), to: '/outlets' },
            ...(c.editing && c.outlet ? [{ label: c.outlet.name, to: '/outlets/$id', params: { id: String(c.outlet.id) } }] : []),
          ]}
          current={title}
        />
      }
      actions={<TopFormActions />}
      title={title}
      description={c.editing ? t('outlets.detail.editSubtitle') : t('outlets.detail.createSubtitle')}
    />
  );

  if (c.loading || c.isMissing || c.error) {
    return (
      <FormActionsProvider><OutletBanner markers={[]} header={header}>
        <ErrorText error={c.error && !c.isMissing ? c.error : null} />
        {c.loading && <p className="text-sm text-muted-foreground">{t('outlets.detail.loading')}</p>}
        {c.isMissing && <p className="rounded-3xl border border-border bg-card p-5 text-sm text-muted-foreground">{t('outlets.detail.notFound')}</p>}
      </OutletBanner></FormActionsProvider>
    );
  }
  return (
    <FormActionsProvider>
      <OutletForm key={c.outlet?.id ?? 'new'} outlet={c.outlet} header={header} onSaved={c.onSaved} onCancel={c.onCancel} />
    </FormActionsProvider>
  );
}
