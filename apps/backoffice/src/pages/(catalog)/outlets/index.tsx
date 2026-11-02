import { Link } from '@tanstack/react-router';
import { Store } from 'lucide-react';
import { buttonVariants, EmptyState, ErrorText, ServerTable } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import { OutletBanner } from '@/features/outlets/components/outlet-map';
import { OutletsHeader } from '@/features/outlets/components/outlets-header';
import { OutletsFilters } from '@/features/outlets/components/outlets-filters';
import { useOutletsPage } from '@/features/outlets/hooks/use-outlets-page';
import { ActivityButton } from '@/features/activity';
import { OutletsLegend } from '@/features/outlets/components/outlets-legend';

export function OutletsPage() {
  const { t } = useTranslation();
  const c = useOutletsPage();

  return (
    <OutletBanner
      markers={c.markers}
      onOpen={c.openOutlet}
      header={
        <OutletsHeader
          title={t('outlets.title')}
          description={t('outlets.subtitle')}
          actions={
            <>
              <ActivityButton entityType="outlet" />
              <Link to="/outlets/new" className={buttonVariants({ variant: 'primary' })}>{t('outlets.add')}</Link>
            </>
          }
        />
      }
    >
      <ErrorText error={c.error} />
      <ServerTable
        state={c.table}
        data={c.rows}
        total={c.total}
        ready={c.ready}
        columns={c.columns}
        rowId={(o) => String(o.id)}
        labels={c.labels}
        filters={<OutletsFilters {...c.filters} />}
        legend={<OutletsLegend />}
        emptyState={
          <EmptyState icon={Store} title={t('outlets.emptyTitle')} description={t('outlets.emptyDescription')}>
            <Link to="/outlets/new" className={buttonVariants({ variant: 'primary' })}>{t('outlets.add')}</Link>
          </EmptyState>
        }
      />
      <p className="text-xs text-muted-foreground">{t('outlets.staffNote')}</p>
    </OutletBanner>
  );
}
