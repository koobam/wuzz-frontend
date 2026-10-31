import { Link } from '@tanstack/react-router';
import { SlidersHorizontal } from 'lucide-react';
import { buttonVariants, EmptyState, ErrorText, Page, ServerTable } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import { GroupFilters } from '@/features/group/components/group-filters';
import { RequirementFilter } from '@/features/group/components/requirement-filter';
import { useModifiersPage } from '@/features/group/hooks/use-modifiers-page';
import { ActivityButton } from '@/features/activity';
import { GroupsLegend } from '@/features/group/components/groups-legend';

/**
 * The modifier groups: reusable add-ons with a rule for how many to pick ("Free Sauce": pick 1 to 2). A group is made here
 * once and chosen by every service that carries it; an option's price is added to the service's price.
 */
export function ModifiersPage() {
  const { t } = useTranslation();
  const c = useModifiersPage();

  return (
    <Page
      title={t('groups.modifiers.title')}
      subtitle={t('groups.modifiers.subtitle')}
      actions={<div className="flex flex-wrap items-center gap-2"><ActivityButton entityType="modifier_group" /><Link to="/modifiers/new" className={buttonVariants({ variant: 'primary' })}>{t('groups.modifiers.add')}</Link></div>}
    >
      <ErrorText error={c.error} />
      <ServerTable
        state={c.table}
        data={c.rows}
        total={c.total}
        ready={c.ready}
        columns={c.columns}
        rowId={(g) => String(g.id)}
        labels={c.labels}
        filters={
          <>
            <GroupFilters {...c.filters} />
            <RequirementFilter {...c.requirement} />
          </>
        }
        legend={<GroupsLegend kind="modifiers" />}
        emptyState={
          <EmptyState icon={SlidersHorizontal} title={t('groups.modifiers.emptyTitle')} description={t('groups.modifiers.emptyDescription')}>
            <Link to="/modifiers/new" className={buttonVariants({ variant: 'primary' })}>{t('groups.modifiers.add')}</Link>
            <Link to="/services" className={buttonVariants()}>{t('groups.modifiers.seeServices')}</Link>
          </EmptyState>
        }
      />
    </Page>
  );
}
