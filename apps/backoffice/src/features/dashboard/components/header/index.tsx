import { RefreshCw } from 'lucide-react';
import { Button, DateRangePicker, type DayRange } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';

/** What sits in the dashboard's title row: the date range and the button that fetches everything again. */
export function DashboardHeader({ range, onRange, refreshing, onRefresh }: { range: DayRange; onRange: (r: DayRange) => void; refreshing: boolean; onRefresh: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <DateRangePicker value={range} onChange={onRange} />
      <Button variant="primary" onClick={onRefresh} disabled={refreshing} className="flex items-center gap-2 py-2.5 disabled:opacity-60">
        <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
        {t('dashboard.refresh')}
      </Button>
    </div>
  );
}
