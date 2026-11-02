import { Link } from '@tanstack/react-router';
import { FlaskConical } from 'lucide-react';
import { buttonVariants, EmptyState, ErrorText, FilterField, Page, Select, ServerTable } from '@wuzz/web-ui';
import { MATERIAL_CATEGORIES, type MaterialCategory } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { useMaterialsPage } from '@/features/materials/hooks/use-materials-page';
import { ActivityButton } from '@/features/activity';
import { MaterialsLegend } from '@/features/materials/components/materials-legend';

/** The materials that are stocked and used in BOMs. A unit's cost is the exact fraction price / quantity, never a stored rounded figure. */
export function MaterialsPage() {
  const { t } = useTranslation();
  const c = useMaterialsPage();

  return (
    <Page title={t('materials.title')} subtitle={t('materials.subtitle')} actions={<div className="flex flex-wrap items-center gap-2"><ActivityButton entityType="material" /><Link to="/materials/new" className={buttonVariants({ variant: 'primary' })}>{t('materials.add')}</Link></div>}>
      <ErrorText error={c.error} />
      <ServerTable
        state={c.table}
        data={c.rows}
        total={c.total}
        ready={c.ready}
        columns={c.columns}
        rowId={(m) => String(m.id)}
        labels={c.labels}
        filters={
          <>
            <FilterField label={t('filter.category')}>
            <Select
              ariaLabel={t('filter.category')}
              className="w-full"
              value={c.filters.category}
              onChange={c.filters.onCategory}
              options={[{ value: '' as MaterialCategory | '', label: t('materials.allCategories') }, ...MATERIAL_CATEGORIES.map((m) => ({ value: m as MaterialCategory | '', label: t(`materials.category.${m}`) }))]}
            />
            </FilterField>
            <FilterField label={t('filter.status')}>
            <Select
              ariaLabel={t('filter.status')}
              className="w-full"
              value={c.filters.active}
              onChange={c.filters.onActive}
              options={[
                { value: '' as const, label: t('materials.allStatus') },
                { value: 'true' as const, label: t('materials.active') },
                { value: 'false' as const, label: t('materials.inactive') },
              ]}
            />
            </FilterField>
          </>
        }
        legend={<MaterialsLegend />}
        emptyState={
          <EmptyState icon={FlaskConical} title={t('materials.emptyTitle')} description={t('materials.emptyDescription')}>
            <Link to="/materials/new" className={buttonVariants({ variant: 'primary' })}>{t('materials.add')}</Link>
            <Link to="/costing" className={buttonVariants()}>{t('materials.seeRecipes')}</Link>
          </EmptyState>
        }
      />
    </Page>
  );
}
