import { ErrorText, Page } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import { FormActionsProvider, PageNav, TopFormActions } from '@/features/shell';
import { VariantForm } from '@/features/group/components/variant-form';
import { useVariantFormPage } from '@/features/group/hooks/use-variant-form-page';

/** The page that makes a variant group, or edits the one in the address. */
export function VariantFormPage() {
  const { t } = useTranslation();
  const c = useVariantFormPage();

  return (
    <FormActionsProvider>
    <Page
      actions={<TopFormActions />}
      title={c.editing ? t('groups.variantEditTitle') : t('groups.variants.add')}
      subtitle={c.editing ? t('groups.variants.editSubtitle') : t('groups.variants.createSubtitle')}
      nav={
        <PageNav
          back={c.editing && c.group ? { to: '/variants/$id', params: { id: String(c.group.id) } } : { to: '/variants' }}
          backLabel={c.editing && c.group ? c.group.name : t('groups.variants.title')}
          trail={[
            { label: t('groups.variants.title'), to: '/variants' },
            ...(c.editing && c.group ? [{ label: c.group.name, to: '/variants/$id', params: { id: String(c.group.id) } }] : []),
          ]}
          current={c.editing ? t('groups.variantEditTitle') : t('groups.variants.add')}
        />
      }
    >
      <ErrorText error={c.error && !c.isMissing ? c.error : null} />
      {c.loading && <p className="text-sm text-muted-foreground">{t('groups.detail.loading')}</p>}
      {c.isMissing && <p className="rounded-3xl border border-border bg-card p-5 text-sm text-muted-foreground">{t('groups.detail.notFound')}</p>}
      {!c.loading && !c.isMissing && <VariantForm key={c.group?.id ?? 'new'} group={c.group} onSaved={c.onSaved} onCancel={c.onCancel} />}
    </Page>
    </FormActionsProvider>
  );
}
