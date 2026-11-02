import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Controller } from 'react-hook-form';
import { Button, ErrorText, Field, formatDecimal, Select, TextField } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import { type StockRow, WASTE_REASONS } from '@/core/api';
import { useStockDialogForm } from '../../hooks/use-stock-dialog-form';
import type { StockAction } from '../../utils/stock-dialog.schema';

export type { StockAction };

/** One stock action on one outlet's material, in a sheet. The key makes a double click or a retry book only once. */
export function StockDialog({ action, row, onDone, onClose }: { action: StockAction; row: StockRow; onDone: () => void; onClose: () => void }) {
  const { t, i18n } = useTranslation();
  const panel = useRef<HTMLFormElement>(null);
  const { form, submit, outlets, pending, error } = useStockDialogForm({ action, row, onDone });
  const { register, control, watch, formState } = form;
  const { errors, isValid } = formState;

  useEffect(() => {
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const unit = t(`materials.unit.${row.unit}`);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={t(`stock.action.${action}`)}
        tabIndex={-1}
        onSubmit={submit}
        className="animate-[dialog-in_160ms_ease-out_both] flex max-h-[90dvh] w-full max-w-md flex-col gap-4 overflow-y-auto rounded-3xl border border-border bg-card p-6 outline-none motion-reduce:animate-none"
      >
        <header className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{t(`stock.action.${action}`)}</h2>
            <p className="text-sm text-muted-foreground">
              <span className="font-mono text-xs">{row.sku}</span> · {row.name}
            </p>
            <p className="text-xs text-muted-foreground">{t('stock.form.book', { qty: formatDecimal(row.qty, i18n.language), unit })}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={t('stock.form.cancel')} className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-accent">
            <X className="size-5" />
          </button>
        </header>

        <p className="rounded-2xl bg-muted/70 px-4 py-3 text-sm text-muted-foreground">{t(`stock.hint.${action}`)}</p>

        {action === 'transfer' && (
          <Controller
            control={control}
            name="to"
            render={({ field }) => (
              <Field label={t('stock.form.toOutlet')} required>
                {(id) => (
                  <Select inputId={id} shape="field" ariaLabel={t('stock.form.toOutlet')} placeholder={t('stock.form.toOutlet')} className="w-full" value={field.value} onChange={field.onChange} options={outlets.map((o) => ({ value: o.id, label: o.name }))} />
                )}
              </Field>
            )}
          />
        )}
        <TextField
          label={`${action === 'adjustment' ? t('stock.form.countedQty') : action === 'min' ? t('stock.form.minQty') : t('stock.form.qty')} (${unit})`}
          required
          inputMode="decimal"
          placeholder={t('stock.form.qtyPlaceholder')}
          autoFocus
          error={errors.qty && watch('qty') !== '' ? errors.qty.message : undefined}
          {...register('qty')}
        />
        {action === 'receipt' && (
          <>
            <TextField label={t('stock.form.totalCost')} required placeholder={t('stock.form.costPlaceholder')} inputMode="numeric" error={errors.cost?.message} {...register('cost')} />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label={t('stock.form.supplier')} placeholder={t('stock.form.supplierPlaceholder')} maxLength={80} {...register('supplier')} />
              <TextField label={t('stock.form.docNo')} placeholder={t('stock.form.docNoPlaceholder')} maxLength={40} {...register('docNo')} />
            </div>
          </>
        )}
        {action === 'waste' && (
          <Controller
            control={control}
            name="reason"
            render={({ field }) => (
              <Field label={t('stock.form.reason')} required>
                {(id) => <Select inputId={id} shape="field" ariaLabel={t('stock.form.reason')} className="w-full" value={field.value} onChange={field.onChange} options={WASTE_REASONS.map((r) => ({ value: r, label: t(`stock.reason.${r}`) }))} />}
              </Field>
            )}
          />
        )}
        {action !== 'min' && (
          <TextField label={action === 'adjustment' ? t('stock.form.noteRequired') : t('stock.form.note')} required={action === 'adjustment'} placeholder={t('stock.form.notePlaceholder')} maxLength={200} {...register('note')} />
        )}
        <ErrorText error={error} />
        <div className="flex gap-2">
          <Button type="submit" variant="primary" size="lg" className="flex-1" disabled={!isValid || pending}>{t('stock.form.save')}</Button>
          <Button onClick={onClose}>{t('stock.form.cancel')}</Button>
        </div>
      </form>
    </div>
  );
}
