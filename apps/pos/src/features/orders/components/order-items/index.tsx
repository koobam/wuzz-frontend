import { CatalogIcon } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import { lineLabel, type OrderLine } from '@/core/pos/types';

/** The items of an order in a table cell: up to three icons, "+N" for the rest, and the first two lines in words. */
export function OrderItems({ lines, iconOf }: { lines: OrderLine[]; iconOf: (itemId: number) => string }) {
  const { t } = useTranslation();
  const text = lines.slice(0, 2).map((l) => `${lineLabel(l)} (${l.qty} ${l.unit})`);
  if (lines.length > 2) text.push(t('orders.more', { count: lines.length - 2 }));
  return (
    <span className="flex items-center gap-3">
      <span className="flex shrink-0 items-center -space-x-3">
        {lines.slice(0, 3).map((l, i) => (
          <span key={`${l.itemId}-${i}`} title={`${lineLabel(l)} × ${l.qty} ${l.unit}`} className="relative grid size-10 place-items-center rounded-xl border-2 border-card bg-muted" style={{ zIndex: 3 - i }}>
            <CatalogIcon name={iconOf(l.itemId)} size={24} className="size-6" />
          </span>
        ))}
        {lines.length > 3 && (
          <span
            title={lines.slice(3).map((l) => `${lineLabel(l)} × ${l.qty} ${l.unit}`).join('\n')}
            className="relative grid h-7 min-w-7 place-items-center rounded-full border-2 border-card bg-ink px-2 text-xs font-medium text-background"
          >
            +{lines.length - 3}
          </span>
        )}
      </span>
      <span className="max-w-80 min-w-40 text-sm leading-snug">{text.join(', ')}</span>
    </span>
  );
}
