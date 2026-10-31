import { useTranslation } from '@/core/utils/i18n';

const HATCH = 'repeating-linear-gradient(135deg, #e2483d 0 2px, #f6c3bf 2px 5px)';

/** How much of the range's orders were fulfilled, as a hatched bar. */
export function RateCard({ rate, done, total }: { rate: number; done: number; total: number }) {
  const { t } = useTranslation();
  return (
    <section className="shrink-0 rounded-3xl border border-border bg-card p-5">
      <h2 className="text-sm font-semibold">{t('dashboard.rate.title')}</h2>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full" style={{ width: `${rate}%`, backgroundImage: HATCH }} />
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{t('dashboard.rate.done', { done, total })}</span>
        <span>{rate}%</span>
      </div>
    </section>
  );
}
