import { Link } from '@tanstack/react-router';
import { Button, buttonVariants, ErrorText, Page } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import { PageNav } from '@/features/shell';
import { ServiceDetail } from '@/features/services/components/service-detail';
import { useServiceDetailPage } from '@/features/services/hooks/use-service-detail-page';
import { ActivityButton } from '@/features/activity';

/** One service in full, read-only; the Edit button opens the form. */
export function ServiceDetailPage() {
  const { t } = useTranslation();
  const c = useServiceDetailPage();

  return (
    <Page
      title={c.service?.name ?? t('services.detail.title')}
      subtitle={t('services.detail.subtitle')}
      nav={
        <PageNav
          back={{ to: '/services' }}
          backLabel={t('services.title')}
          trail={[{ label: t('services.title'), to: '/services' }]}
          current={c.service?.name ?? t('services.detail.title')}
        />
      }
      actions={c.service && (
        <div className="flex flex-wrap items-center gap-2">
          <ActivityButton entityType="service" entityId={c.service.id} />
          <ActivityButton entityType="bom" entityId={`service:${c.service.id}`} label={t('activity.recipeTitle')} />
          <Button variant="outline" className="text-destructive hover:bg-destructive/10" disabled={c.deleting} onClick={() => void c.onDelete()}>{t('common.delete')}</Button>
          <Link to="/services/$id/edit" params={{ id: String(c.service.id) }} className={buttonVariants({ variant: 'primary' })}>{t('common.edit')}</Link>
        </div>
      )}
    >
      <ErrorText error={c.error} />
      {c.loading && <p className="text-sm text-muted-foreground">{t('services.detail.loading')}</p>}
      {c.isMissing && <p className="rounded-3xl border border-border bg-card p-5 text-sm text-muted-foreground">{t('services.detail.notFound')}</p>}
      {c.service && <ServiceDetail service={c.service} category={c.category} />}
    </Page>
  );
}
