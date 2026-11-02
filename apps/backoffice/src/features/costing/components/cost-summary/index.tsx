import { formatDecimal, rupiah } from '@wuzz/web-ui';
import type { ServiceCosting } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';

/** The three numbers over a service's recipe: what it sells for, what the base recipe costs, and what is left. */
export function CostSummary({ costing, overview, dec }: { costing: ServiceCosting; overview: { profit: string; pct: string }; dec: (s: string) => string }) {
  const { t, i18n } = useTranslation();
  return (
    <section className="space-y-2">
      <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-2xl bg-muted/70 px-4 py-3">
          <dt className="text-xs text-muted-foreground">{t('costing.sellPrice')}</dt>
          <dd className="text-lg font-semibold tabular-nums">{rupiah(costing.service.price)} / {costing.service.unit}</dd>
        </div>
        <div className="rounded-2xl bg-muted/70 px-4 py-3">
          <dt className="text-xs text-muted-foreground">{t('costing.baseCost')}</dt>
          <dd className="text-lg font-semibold tabular-nums">Rp {dec(costing.base.per_unit)} / {costing.service.unit}</dd>
        </div>
        <div className="rounded-2xl bg-muted/70 px-4 py-3">
          <dt className="text-xs text-muted-foreground">{t('costing.baseProfit')}</dt>
          <dd className="text-lg font-semibold tabular-nums">≈ Rp {formatDecimal(overview.profit, i18n.language)} <span className="text-sm font-normal text-muted-foreground">({t('costing.baseMargin', { pct: formatDecimal(overview.pct, i18n.language) })})</span></dd>
        </div>
      </dl>
      <p className="text-xs text-muted-foreground">{t('costing.approx')}</p>
    </section>
  );
}
