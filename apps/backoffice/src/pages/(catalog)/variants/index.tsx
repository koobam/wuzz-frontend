import { Link } from '@tanstack/react-router';
import { Layers } from 'lucide-react';
import { buttonVariants, EmptyState, ErrorText, Page, ServerTable } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import { GroupFilters } from '@/features/group/components/group-filters';
import { useVariantsPage } from '@/features/group/hooks/use-variants-page';
import { ActivityButton } from '@/features/activity';
import { GroupsLegend } from '@/features/group/components/groups-legend';

/**
 * The variant groups: reusable sets of options of which the customer picks exactly one ("Ukuran": Base, Large). A group is
 * made here once and chosen by every service that carries it; an option's price is added to the service's price.
 */
export function VariantsPage() {
  const { t } = useTranslation();
  const c = useVariantsPage();

  return (
    <Page
      title={t('groups.variants.title')}
      subtitle={t('groups.variants.subtitle')}
      actions={<div className="flex flex-wrap items-center gap-2"><ActivityButton entityType="variant_group" /><Link to="/variants/new" className={buttonVariants({ variant: 'primary' })}>{t('groups.variants.add')}</Link></div>}
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
        filters={<GroupFilters {...c.filters} />}
        legend={<GroupsLegend kind="variants" />}
        emptyState={
          <EmptyState icon={Layers} title={t('groups.variants.emptyTitle')} description={t('groups.variants.emptyDescription')}>
            <Link to="/variants/new" className={buttonVariants({ variant: 'primary' })}>{t('groups.variants.add')}</Link>
            <Link to="/services" className={buttonVariants()}>{t('groups.variants.seeServices')}</Link>
          </EmptyState>
        }
      />
    </Page>
  );
}
