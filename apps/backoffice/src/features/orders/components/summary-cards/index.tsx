import { formatDecimal, rupiah } from '@wuzz/web-ui';
import { type OrderSummary } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';

/** The figures above the list: how many transactions, what they are worth, and the averages. They follow the list's filters. */
export function SummaryCards({ summary }: { summary: OrderSummary | undefined }) {
  const { t, i18n } = useTranslation();
  const pct = (v: string) => formatDecimal(v, i18n.language);
  const tiles: [string, string, string][] = summary
    ? [
        [t('orders.summary.total'), String(summary.orders), t('orders.summary.totalSub', { open: summary.open, done: summary.fulfilled, cancelled: summary.cancelled })],
        [t('orders.summary.value'), rupiah(summary.value), t('orders.summary.valueSub', { count: summary.orders })],
        [t('orders.summary.avgValue'), rupiah(summary.avg_value), t('orders.summary.avgValueSub', { count: summary.orders })],
        [t('orders.summary.avgLines'), formatDecimal(summary.avg_lines, i18n.language), t('orders.summary.avgLinesSub', { lines: summary.lines, count: summary.orders })],
        [t('orders.summary.cancelled'), String(summary.cancelled), t('orders.summary.cancelledSub', { pct: pct(summary.cancelled_percent) })],
      ]
    : [];
  return (
    <dl className="grid shrink-0 grid-cols-2 gap-3 text-sm lg:grid-cols-5">
      {(tiles.length ? tiles : Array.from({ length: 5 }, () => ['', '', ''] as [string, string, string])).map(([k, v, sub], i) => (
        <div key={i} className="rounded-2xl bg-muted/70 px-4 py-2.5">
          <dt className="text-xs text-muted-foreground">{k || '\u00a0'}</dt>
          <dd className="text-lg leading-snug font-semibold tabular-nums">{v || '\u00a0'}</dd>
          <dd className="text-xs text-muted-foreground">{sub || '\u00a0'}</dd>
        </div>
      ))}
    </dl>
  );
}
