import { Link } from '@tanstack/react-router';
import { Sparkles } from 'lucide-react';
import { buttonVariants, EmptyState, ErrorText, Page, ServerTable } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import { ServicesFilters } from '@/features/services/components/services-filters';
import { useServicesPage } from '@/features/services/hooks/use-services-page';
import { ActivityButton } from '@/features/activity';
import { ServicesLegend } from '@/features/services/components/services-legend';

export function ServicesPage() {
  const { t } = useTranslation();
  const c = useServicesPage();

  return (
    <Page title={t('services.title')} subtitle={t('services.subtitle')} actions={<div className="flex flex-wrap items-center gap-2"><ActivityButton entityType="service" /><Link to="/services/new" className={buttonVariants({ variant: 'primary' })}>{t('services.add')}</Link></div>}>
      <ErrorText error={c.error} />
      <ServerTable
        state={c.table}
        data={c.rows}
        total={c.total}
        ready={c.ready}
        columns={c.columns}
        rowId={(s) => String(s.id)}
        labels={c.labels}
        filters={<ServicesFilters {...c.filters} />}
        legend={<ServicesLegend />}
        emptyState={
          <EmptyState icon={Sparkles} title={t('services.emptyTitle')} description={t('services.emptyDescription')}>
            <Link to="/services/new" className={buttonVariants({ variant: 'primary' })}>{t('services.add')}</Link>
          </EmptyState>
        }
      />
      <p className="text-xs text-muted-foreground">{t('services.priceNote')}</p>
    </Page>
  );
}
