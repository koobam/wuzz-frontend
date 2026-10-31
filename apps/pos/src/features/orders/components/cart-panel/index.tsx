import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button, CatalogIcon, rupiah, TextField } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import type { Outlet } from '@/core/pos/types';
import { stepOf } from '../../utils/pricing';
import type { useCustomerForm } from '../../hooks/use-customer-form';

type Line = { key: string; name: string; unit: string; icon: string; price: number; qty: number; variant?: string; modifiers: { name: string }[] };

/** The order so far, who it is for and where, the total and the button that saves it. */
export function CartPanel({
  lines,
  total,
  customer,
  outlet,
  canSave,
  saved,
  saving,
  error,
  onSetLine,
  onSave,
}: {
  lines: Line[];
  total: number;
  customer: ReturnType<typeof useCustomerForm>;
  outlet?: Outlet;
  canSave: boolean;
  saved: string | null;
  saving: boolean;
  error: { network: boolean; message: string } | null;
  onSetLine: (key: string, value: number) => void;
  onSave: () => void;
}) {
  const { t } = useTranslation();
  return (
    <aside className="space-y-4 rounded-3xl border border-border bg-card p-5 xl:sticky xl:top-0">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('newOrder.summary')}</h2>
        {lines.length > 0 && <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs">{t('orders.items', { count: lines.length })}</span>}
      </div>

      {lines.length === 0 ? (
        <p className="rounded-2xl bg-muted/70 px-3 py-6 text-center text-sm text-muted-foreground">{t('newOrder.noItems')}</p>
      ) : (
        <ul className="divide-y divide-border rounded-2xl bg-muted/70 text-sm">
          {lines.map((l) => (
            <li key={l.key} className="flex items-center gap-3 px-3 py-2.5">
              <CatalogIcon name={l.icon} size={44} />
              <span className="min-w-0 flex-1">
                <span className="block truncate">
                  {l.name}
                  {l.variant ? ` · ${l.variant}` : ''}
                </span>
                {l.modifiers.length > 0 && <span className="block truncate text-xs text-muted-foreground">+ {l.modifiers.map((m) => m.name).join(', ')}</span>}
                <span className="text-xs text-muted-foreground">
                  {l.qty} {l.unit} × {rupiah(l.price)}
                </span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-1">
                <span className="tabular-nums">{rupiah(Math.round(l.price * l.qty))}</span>
                <span className="flex items-center gap-1">
                  <button type="button" onClick={() => onSetLine(l.key, l.qty - stepOf(l))} aria-label={t('newOrder.less', { name: l.name })} className="grid size-6 place-items-center rounded-full bg-background hover:bg-accent">
                    <Minus className="size-3" />
                  </button>
                  <button type="button" onClick={() => onSetLine(l.key, l.qty + stepOf(l))} aria-label={t('newOrder.more', { name: l.name })} className="grid size-6 place-items-center rounded-full bg-background hover:bg-accent">
                    <Plus className="size-3" />
                  </button>
                  <button type="button" onClick={() => onSetLine(l.key, 0)} aria-label={t('newOrder.remove', { name: l.name })} className="grid size-6 place-items-center rounded-full bg-background text-muted-foreground hover:bg-accent">
                    <Trash2 className="size-3" />
                  </button>
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-end justify-between">
        <span className="text-sm text-muted-foreground">{t('newOrder.total')}</span>
        <span className="text-2xl font-semibold tabular-nums">{rupiah(total)}</span>
      </div>

      <div className="space-y-3 border-t border-border pt-4">
        <TextField label={t('newOrder.customerName')} placeholder={t('newOrder.customerNamePlaceholder')} {...customer.form.register('name')} />
        <TextField label={t('newOrder.customerPhone')} placeholder={t('newOrder.customerPhonePlaceholder')} inputMode="tel" {...customer.form.register('phone')} />
        {outlet && <div className="text-sm text-muted-foreground">{outlet.name}</div>}
      </div>

      <Button variant="primary" size="lg" block disabled={!canSave || saving} onClick={onSave}>
        {saving ? t('newOrder.saving') : t('newOrder.save')}
      </Button>
      {error && (
        <p role="alert" className="text-center text-xs text-destructive">
          {error.network ? t('newOrder.saveOffline') : t('newOrder.saveFailed', { message: error.message })}
        </p>
      )}
      {saved && <p className="text-center text-xs text-muted-foreground">{t('newOrder.saved', { id: saved })}</p>}
    </aside>
  );
}
