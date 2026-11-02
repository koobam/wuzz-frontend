import { ErrorText, Page } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import { FormActionsProvider, PageNav, TopFormActions } from '@/features/shell';
import { MaterialForm } from '@/features/materials/components/material-form';
import { useMaterialFormPage } from '@/features/materials/hooks/use-material-form-page';

/** The page that makes a material, or edits the one in the address. */
export function MaterialFormPage() {
  const { t } = useTranslation();
  const c = useMaterialFormPage();

  return (
    <FormActionsProvider>
    <Page
      actions={<TopFormActions />}
      title={c.editing ? t('materials.detail.editTitle') : t('materials.detail.createTitle')}
      subtitle={c.editing ? t('materials.detail.editSubtitle') : t('materials.detail.createSubtitle')}
      nav={
        <PageNav
          back={c.editing && c.material ? { to: '/materials/$id', params: { id: String(c.material.id) } } : { to: '/materials' }}
          backLabel={c.editing && c.material ? c.material.name : t('materials.title')}
          trail={[
            { label: t('materials.title'), to: '/materials' },
            ...(c.editing && c.material ? [{ label: c.material.name, to: '/materials/$id', params: { id: String(c.material.id) } }] : []),
          ]}
          current={c.editing ? t('materials.detail.editTitle') : t('materials.detail.createTitle')}
        />
      }
    >
      <ErrorText error={c.error && !c.isMissing ? c.error : null} />
      {c.loading && <p className="text-sm text-muted-foreground">{t('materials.detail.loading')}</p>}
      {c.isMissing && <p className="rounded-3xl border border-border bg-card p-5 text-sm text-muted-foreground">{t('materials.detail.notFound')}</p>}
      {!c.loading && !c.isMissing && <MaterialForm key={c.material?.id ?? 'new'} material={c.material} onSaved={c.onSaved} onCancel={c.onCancel} />}
    </Page>
    </FormActionsProvider>
  );
}
