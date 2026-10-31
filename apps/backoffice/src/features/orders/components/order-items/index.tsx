import { useTranslation } from '@/core/utils/i18n';
import { lineLabel, type Order, type Service } from '@/core/api';
import { CatalogIcon } from '@wuzz/web-ui';

const SHOWN = 3;

/**
 * What an order bought, as a stack of overlapping icons: the first few services (the icon of each, looked up in the
 * catalog by the line's id) and "+N" for the rest. Hover one for its name and quantity; a service that is no longer in
 * the catalog still shows, with a neutral icon, because the order itself remembers its name.
 */
export function OrderItems({ lines, services, names = false }: { lines: Order['lines']; services: Service[] | undefined; names?: boolean }) {
  const { t } = useTranslation();
  const icon = (itemId: number) => services?.find((s) => s.id === itemId)?.icon ?? '';
  const rest = lines.slice(SHOWN);
  const stack = (
    <span className="flex shrink-0 items-center -space-x-3">
      {lines.slice(0, SHOWN).map((l, i) => (
        <span key={`${l.item_id}-${i}`} title={`${lineLabel(l)} × ${l.qty} ${l.unit}`} className="relative grid size-10 place-items-center rounded-xl border-2 border-card bg-muted" style={{ zIndex: SHOWN - i }}>
          <CatalogIcon name={icon(l.item_id)} size={24} className="size-6" />
        </span>
      ))}
      {rest.length > 0 && (
        <span
          title={rest.map((l) => `${lineLabel(l)} × ${l.qty} ${l.unit}`).join('\n')}
          className="relative grid h-7 min-w-7 place-items-center rounded-full border-2 border-card bg-ink px-2 text-xs font-medium text-background"
        >
          +{rest.length}
        </span>
      )}
    </span>
  );
  if (!names) return stack;
  // The names beside the icons: on one line, wrapping only when there is no room. Past two, "+N more".
  const text = lines.slice(0, 2).map((l) => `${lineLabel(l)} (${l.qty} ${l.unit})`);
  if (lines.length > 2) text.push(t('orders.more', { count: lines.length - 2 }));
  return (
    <span className="flex items-center gap-3">
      {stack}
      <span className="max-w-80 min-w-40 text-sm leading-snug">{text.join(', ')}</span>
    </span>
  );
}
