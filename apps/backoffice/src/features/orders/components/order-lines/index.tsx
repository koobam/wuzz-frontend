import { CatalogIcon, rupiah } from '@wuzz/web-ui';
import type { Order } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';

/** What was ordered: each line with its variant, its modifiers and its price, and the total under them. */
export function OrderLines({ order, iconOf }: { order: Order; iconOf: (itemId: number) => string }) {
  const { t } = useTranslation();
  return (
    <section className="space-y-4 rounded-3xl border border-border bg-card p-5">
      <h2 className="text-sm font-semibold">{t('orders.detail.items', { count: order.lines.length })}</h2>
      <ul className="divide-y divide-border rounded-2xl border border-border">
        {order.lines.map((l, i) => (
          <li key={i} className="flex items-start gap-4 p-4 text-sm">
            <CatalogIcon name={iconOf(l.item_id)} size={48} className="size-10 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="font-medium">{l.name}{l.variant ? ` · ${l.variant}` : ''}</div>
              {l.modifiers && l.modifiers.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {l.modifiers.map((m) => (
                    <span key={m.name} className="rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs">
                      {m.name}{m.price > 0 ? ` +${rupiah(m.price)}` : ''}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-1.5 text-xs text-muted-foreground tabular-nums">{l.qty} {l.unit} × {rupiah(l.price)}</div>
            </div>
            <div className="shrink-0 font-medium tabular-nums">{rupiah(Math.round(l.price * l.qty))}</div>
          </li>
        ))}
      </ul>
      <div className="flex items-end justify-between border-t border-border pt-4">
        <span className="text-sm text-muted-foreground">{t('orders.detail.total')}</span>
        <span className="text-2xl font-semibold tabular-nums">{rupiah(order.total)}</span>
      </div>
      <p className="text-xs text-muted-foreground">{t('orders.detail.note')}</p>
    </section>
  );
}
