import { Link } from '@tanstack/react-router';
import { buttonVariants, ErrorText, Page } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import { PageNav } from '@/features/shell';
import { GroupDetail } from '@/features/group/components/group-detail';
import { useModifierDetailPage } from '@/features/group/hooks/use-modifier-detail-page';
import { ActivityButton } from '@/features/activity';

/** One modifier group in full, read-only; the Edit button opens the form. */
export function ModifierDetailPage() {
  const { t } = useTranslation();
  const c = useModifierDetailPage();

  return (
    <Page
      title={c.group?.name ?? t('groups.modifiers.title')}
      subtitle={t('groups.modifiers.detailSubtitle')}
      nav={
        <PageNav
          back={{ to: '/modifiers' }}
          backLabel={t('groups.modifiers.title')}
          trail={[{ label: t('groups.modifiers.title'), to: '/modifiers' }]}
          current={c.group?.name ?? t('groups.modifiers.title')}
        />
      }
      actions={c.group && (
        <div className="flex flex-wrap items-center gap-2">
          <ActivityButton entityType="modifier_group" entityId={c.group.id} />
          <Link to="/modifiers/$id/edit" params={{ id: String(c.group.id) }} className={buttonVariants({ variant: 'primary' })}>{t('common.edit')}</Link>
        </div>
      )}
    >
      <ErrorText error={c.error && !c.isMissing ? c.error : null} />
      {c.loading && <p className="text-sm text-muted-foreground">{t('groups.detail.loading')}</p>}
      {c.isMissing && <p className="rounded-3xl border border-border bg-card p-5 text-sm text-muted-foreground">{t('groups.detail.notFound')}</p>}
      {c.group && <GroupDetail group={c.group} rule={c.rule} options={c.options} />}
    </Page>
  );
}
