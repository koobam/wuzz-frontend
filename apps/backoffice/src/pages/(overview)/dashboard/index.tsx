import { ErrorText, Page } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import { ChartCard } from '@/features/dashboard/components/chart-card';
import { DashboardHeader } from '@/features/dashboard/components/header';
import { QuickAccess } from '@/features/dashboard/components/quick-access';
import { RateCard } from '@/features/dashboard/components/rate-card';
import { RecentOrders } from '@/features/dashboard/components/recent-orders';
import { RevenueCard } from '@/features/dashboard/components/revenue-card';
import { ServicesCard } from '@/features/dashboard/components/services-card';
import { StatTiles } from '@/features/dashboard/components/stat-tiles';
import { useDashboardPage } from '@/features/dashboard/hooks/use-dashboard-page';

export function DashboardPage() {
  const { t } = useTranslation();
  const c = useDashboardPage();

  return (
    <Page
      title={c.title}
      subtitle={t('home.subtitle')}
      actions={<DashboardHeader range={c.range} onRange={c.setRange} refreshing={c.refreshing} onRefresh={c.refresh} />}
    >
      <ErrorText error={c.error} />
      <QuickAccess />

      <div className="grid shrink-0 gap-4 xl:grid-cols-3">
        <RevenueCard revenue={c.stats?.revenue} fulfilled={c.summary.fulfilled} outlets={c.outlets} shown={c.shownOutlets} onAreaChange={c.setArea} />
        <StatTiles summary={c.summary} />
        <ChartCard days={c.stats?.days ?? []} range={c.rangeText} />
      </div>

      {/* The dashboard fits the window and does not scroll; this row takes whatever height is left. */}
      <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-3">
        <div className="flex min-h-0 flex-col gap-4 overflow-hidden">
          <RateCard rate={c.summary.rate} done={c.summary.fulfilled} total={c.summary.total ?? 0} />
          <ServicesCard services={c.services} />
        </div>
        <RecentOrders rows={c.recent} services={c.services} search={c.search} onSearch={c.setSearch} status={c.status} onStatus={c.setStatus} />
      </div>
    </Page>
  );
}
