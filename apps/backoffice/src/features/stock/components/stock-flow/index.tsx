import { useTranslation } from '@/core/utils/i18n';

/** The three steps of keeping stock, as pills: what to do first, next and last. */
export function StockFlow() {
  const { t } = useTranslation();
  return (
    <ol className="flex flex-wrap gap-2 text-sm">
      {(['1', '2', '3'] as const).map((n) => (
        <li key={n} className="flex items-center gap-2 rounded-full border border-border bg-card py-1.5 pr-4 pl-1.5">
          <span className="grid size-6 place-items-center rounded-full bg-ink text-xs font-medium text-background">{n}</span>
          {t(`stock.flow.${n}`)}
        </li>
      ))}
    </ol>
  );
}
