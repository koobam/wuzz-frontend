import { useTranslation } from '@/core/utils/i18n';
import type { StockTab } from '../../hooks/use-stock-page';

const TAB = 'rounded-full px-4 py-2 text-sm transition-colors';

/** The two views of the stock page: what is on the shelf, and how it got there. */
export function StockTabs({ value, onChange }: { value: StockTab; onChange: (tab: StockTab) => void }) {
  const { t } = useTranslation();
  return (
    <div role="tablist" className="flex w-fit gap-1 rounded-full border border-border bg-card p-1">
      {(['stock', 'history'] as const).map((k) => (
        <button key={k} role="tab" aria-selected={value === k} onClick={() => onChange(k)} className={`${TAB} ${value === k ? 'bg-ink font-medium text-background' : 'text-muted-foreground hover:text-foreground'}`}>
          {t(`stock.tabs.${k}`)}
        </button>
      ))}
    </div>
  );
}
