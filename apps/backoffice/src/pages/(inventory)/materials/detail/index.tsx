import { Link } from '@tanstack/react-router';
import { buttonVariants, ErrorText, Page } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import { PageNav } from '@/features/shell';
import { MaterialDetail } from '@/features/materials/components/material-detail';
import { useMaterialDetailPage } from '@/features/materials/hooks/use-material-detail-page';
import { ActivityButton } from '@/features/activity';

/** One material in full, read-only; the Edit button opens the form. */
export function MaterialDetailPage() {
  const { t } = useTranslation();
  const c = useMaterialDetailPage();

  return (
    <Page
      title={c.material?.name ?? t('materials.detail.detailTitle')}
      subtitle={t('materials.detail.subtitle')}
      nav={
        <PageNav
          back={{ to: '/materials' }}
          backLabel={t('materials.title')}
          trail={[{ label: t('materials.title'), to: '/materials' }]}
          current={c.material?.name ?? t('materials.detail.detailTitle')}
        />
      }
      actions={c.material && (
        <div className="flex flex-wrap items-center gap-2">
          <ActivityButton entityType="material" entityId={c.material.id} />
          <Link to="/materials/$id/edit" params={{ id: String(c.material.id) }} className={buttonVariants({ variant: 'primary' })}>{t('common.edit')}</Link>
        </div>
      )}
    >
      <ErrorText error={c.error && !c.isMissing ? c.error : null} />
      {c.loading && <p className="text-sm text-muted-foreground">{t('materials.detail.loading')}</p>}
      {c.isMissing && <p className="rounded-3xl border border-border bg-card p-5 text-sm text-muted-foreground">{t('materials.detail.notFound')}</p>}
      {c.material && <MaterialDetail material={c.material} />}
    </Page>
  );
}
