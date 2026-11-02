import type { OrderStats } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { OrdersChart } from '../orders-chart';

/** One card, two sections, like the revenue and map card: the title above, the chart filling the rest. */
export function ChartCard({ days, range }: { days: OrderStats['days']; range: { from: string; to: string } }) {
  const { t } = useTranslation();
  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-border bg-card">
      <div className="p-5">
        <h2 className="text-lg font-semibold">{t('dashboard.chart.heading')}</h2>
        <p className="text-xs text-muted-foreground">{t('dashboard.chart.subtitle', { from: range.from, to: range.to })}</p>
      </div>
      <div className="flex min-h-0 flex-1 flex-col border-t border-border bg-muted/40">
        <OrdersChart days={days} />
      </div>
    </section>
  );
}
