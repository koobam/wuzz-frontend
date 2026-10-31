import { Check, Minus, Plus, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Button, CatalogIcon, rupiah } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import type { CatalogItem, ModifierGroup } from '@/core/pos/types';
import { useItemChoice } from '../../hooks/use-item-choice';
import { type Choice, ruleMet } from '../../utils/pricing';

const OPTION = 'flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-colors';
const ON = 'border-foreground bg-muted';
const OFF = 'border-border hover:bg-accent/60';

/** The round (pick one) or square (pick any) mark at the start of an option. */
function Mark({ on, multiple }: { on: boolean; multiple: boolean }) {
  return (
    <span
      aria-hidden
      className={`grid size-5 shrink-0 place-items-center border-2 transition-colors ${multiple ? 'rounded-md' : 'rounded-full'} ${on ? 'border-foreground bg-foreground text-background' : 'border-input'}`}
    >
      {on && (multiple ? <Check className="size-3.5" strokeWidth={3} /> : <span className="size-1.5 rounded-full bg-background" />)}
    </span>
  );
}

/** The rule of a modifier group in words: "Optional", "Pick exactly 2", "Required, 1–2". */
function useRule() {
  const { t } = useTranslation();
  return (g: ModifierGroup) => {
    if (g.max !== null && g.min === g.max) return t('newOrder.dialog.rule.exact', { n: g.min });
    if (g.min === 0) return g.max === null ? t('newOrder.dialog.rule.optional') : t('newOrder.dialog.rule.optionalMax', { max: g.max });
    return g.max === null ? t('newOrder.dialog.rule.min', { min: g.min }) : t('newOrder.dialog.rule.range', { min: g.min, max: g.max });
  };
}

/** A sheet to choose a service's variants and modifiers and a quantity before it goes on the order. */
export function ItemDialog({ item, onAdd, onClose }: { item: CatalogItem; onAdd: (choice: Choice) => void; onClose: () => void }) {
  const { t } = useTranslation();
  const rule = useRule();
  const panel = useRef<HTMLDivElement>(null);
  const pick = useItemChoice(item);
  const { step, variantPick, countIn, qty, price, valid } = pick;

  useEffect(() => {
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={item.name}
        tabIndex={-1}
        className="animate-[dialog-in_160ms_ease-out_both] flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-border bg-card outline-none motion-reduce:animate-none"
      >
        <header className="flex items-center gap-4 px-6 pt-6 pb-4">
          <CatalogIcon name={item.icon} size={56} />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-semibold tracking-tight">{item.name}</h2>
            <p className="text-sm text-muted-foreground">
              {rupiah(item.price)} / {item.unit}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label={t('newOrder.dialog.close')} className="grid size-9 place-items-center self-start rounded-full text-muted-foreground hover:bg-accent">
            <X className="size-5" />
          </button>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto border-t border-border px-6 py-5">
          {item.variantGroups.map((g) => (
            <fieldset key={g.id}>
              <legend className="mb-3 flex w-full items-center justify-between gap-2 text-sm font-semibold">
                {g.name}
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-normal text-muted-foreground">{t('newOrder.dialog.pickOne')}</span>
              </legend>
              <div className="grid grid-cols-2 gap-2">
                {g.options.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={o.id === variantPick[g.id]}
                    onClick={() => pick.pickVariant(g.id, o.id)}
                    className={`flex flex-col items-start gap-0.5 rounded-2xl border px-4 py-3 text-left transition-colors ${o.id === variantPick[g.id] ? ON : OFF}`}
                  >
                    <span className="font-medium">{o.name}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{o.delta > 0 ? `+${rupiah(o.delta)}` : t('newOrder.dialog.free')}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          ))}

          {item.modifierGroups.map((g) => {
            const multiple = g.max !== 1;
            const full = g.max !== null && countIn(g) >= g.max;
            return (
              <fieldset key={g.id}>
                <legend className="mb-3 flex w-full items-center justify-between gap-2 text-sm font-semibold">
                  {g.name}
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-normal ${ruleMet(g, countIn(g)) ? 'bg-muted text-muted-foreground' : 'bg-foreground text-background'}`}>{rule(g)}</span>
                </legend>
                <div className="space-y-2">
                  {g.options.map((o) => {
                    const on = pick.isPicked(g, o.id);
                    const blocked = multiple && full && !on;
                    return (
                      <button
                        key={o.id}
                        type="button"
                        role={multiple ? 'checkbox' : 'radio'}
                        aria-checked={on}
                        disabled={blocked}
                        onClick={() => pick.toggle(g, o.id)}
                        className={`${OPTION} ${on ? ON : OFF} disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        <Mark on={on} multiple={multiple} />
                        <span className="flex-1">{o.name}</span>
                        <span className="text-muted-foreground tabular-nums">{o.price > 0 ? `+${rupiah(o.price)}` : t('newOrder.dialog.free')}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}
        </div>

        <footer className="flex items-center gap-3 border-t border-border px-6 py-4">
          <span className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">{t('newOrder.qtyLabel')}</span>
          <span className="flex items-center gap-1 rounded-full border border-border p-1">
            <button type="button" disabled={qty <= step} onClick={pick.less} aria-label={t('newOrder.less', { name: item.name })} className="grid size-9 place-items-center rounded-full hover:bg-accent disabled:opacity-40">
              <Minus className="size-4" />
            </button>
            <input
              type="number"
              min={step}
              step={step}
              value={qty}
              onChange={(e) => pick.setQty(Number(e.target.value))}
              aria-label={t('newOrder.quantity', { name: item.name })}
              className="w-14 bg-transparent text-center text-base font-medium outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button type="button" onClick={pick.more} aria-label={t('newOrder.more', { name: item.name })} className="grid size-9 place-items-center rounded-full hover:bg-accent">
              <Plus className="size-4" />
            </button>
          </span>
          </span>
          <Button variant="primary" size="lg" className="flex-1" disabled={!valid} onClick={() => onAdd(pick.choice())}>
            {t('newOrder.dialog.add', { total: rupiah(Math.round(price * qty)) })}
          </Button>
        </footer>
      </div>
    </div>
  );
}
