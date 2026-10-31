import { ErrorText, Page } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import { FormActionsProvider, PageNav, TopFormActions } from '@/features/shell';
import { ModifierForm } from '@/features/group/components/modifier-form';
import { useModifierFormPage } from '@/features/group/hooks/use-modifier-form-page';

/** The page that makes a modifier group, or edits the one in the address. */
export function ModifierFormPage() {
  const { t } = useTranslation();
  const c = useModifierFormPage();

  return (
    <FormActionsProvider>
    <Page
      actions={<TopFormActions />}
      title={c.editing ? t('groups.modifierEditTitle') : t('groups.modifiers.add')}
      subtitle={c.editing ? t('groups.modifiers.editSubtitle') : t('groups.modifiers.createSubtitle')}
      nav={
        <PageNav
          back={c.editing && c.group ? { to: '/modifiers/$id', params: { id: String(c.group.id) } } : { to: '/modifiers' }}
          backLabel={c.editing && c.group ? c.group.name : t('groups.modifiers.title')}
          trail={[
            { label: t('groups.modifiers.title'), to: '/modifiers' },
            ...(c.editing && c.group ? [{ label: c.group.name, to: '/modifiers/$id', params: { id: String(c.group.id) } }] : []),
          ]}
          current={c.editing ? t('groups.modifierEditTitle') : t('groups.modifiers.add')}
        />
      }
    >
      <ErrorText error={c.error && !c.isMissing ? c.error : null} />
      {c.loading && <p className="text-sm text-muted-foreground">{t('groups.detail.loading')}</p>}
      {c.isMissing && <p className="rounded-3xl border border-border bg-card p-5 text-sm text-muted-foreground">{t('groups.detail.notFound')}</p>}
      {!c.loading && !c.isMissing && <ModifierForm key={c.group?.id ?? 'new'} group={c.group} onSaved={c.onSaved} onCancel={c.onCancel} />}
    </Page>
    </FormActionsProvider>
  );
}
