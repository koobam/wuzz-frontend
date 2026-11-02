import { Controller } from 'react-hook-form';
import { Button, ErrorText, Field, formatDecimal, rupiah, Select, TextField } from '@wuzz/web-ui';
import type { ServiceCosting } from '@/core/api';
import { useCalculatorForm } from '../../hooks/use-calculator-form';
import { useTranslation } from '@/core/utils/i18n';

/** Works out the exact cost, revenue and margin of an order line: the service, one option per variant group, any modifiers, and a quantity. */
export function Calculator({ costing }: { costing: ServiceCosting }) {
  const { t, i18n } = useTranslation();
  const { form, submit, result: r, pending, error } = useCalculatorForm(costing);
  const { register, control, formState, watch } = form;
  const fmt = (s: string) => formatDecimal(s, i18n.language);
  const mods = watch('mods');

  return (
    <section className="space-y-4 rounded-3xl border border-border bg-card p-5">
      <div>
        <h3 className="text-sm font-semibold">{t('costing.step3')}</h3>
        <p className="text-xs text-muted-foreground">{t('costing.step3Hint')}</p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {costing.variant_groups.map((g) => (
            <Controller
              key={g.id}
              control={control}
              name={`variants.${g.id}`}
              render={({ field }) => (
                <Field label={`${t('costing.calc.variant')} · ${g.name}`}>
                  {(id) => <Select inputId={id} shape="field" ariaLabel={g.name} className="w-full" value={field.value ?? g.options[0]?.id} onChange={field.onChange} options={g.options.map((o) => ({ value: o.id, label: o.name }))} />}
                </Field>
              )}
            />
          ))}
          <TextField label={`${t('costing.calc.qty')} (${costing.service.unit})`} required inputMode="decimal" placeholder={t('costing.calc.qtyPlaceholder')} error={formState.errors.qty?.message} {...register('qty')} />
          <Button type="submit" variant="primary" size="lg" disabled={!formState.isValid || pending}>{t('costing.calc.run')}</Button>
        </div>
        {costing.modifier_groups.length > 0 && (
          <div className="space-y-2">
            <span className="block text-xs text-muted-foreground">{t('costing.calc.modifiers')}</span>
            <div className="flex flex-wrap gap-2">
              {costing.modifier_groups.flatMap((g) =>
                g.options.map((o) => {
                  const on = mods.includes(o.id);
                  return (
                    <button key={o.id} type="button" aria-pressed={on} onClick={() => form.setValue('mods', on ? mods.filter((x) => x !== o.id) : [...mods, o.id])} className={`rounded-full border px-3 py-1.5 text-sm ${on ? 'border-transparent bg-ink text-background' : 'border-border hover:bg-accent'}`}>
                      {g.name} · {o.name}
                    </button>
                  );
                }),
              )}
            </div>
          </div>
        )}
      </form>
      <ErrorText error={error} />
      {r && (
        <div className="space-y-4">
          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
            {[
              [t('costing.calc.unitPrice'), rupiah(r.unit_price)],
              [t('costing.calc.revenue'), rupiah(r.revenue)],
              [t('costing.calc.cost'), rupiah(r.cost)],
              [t('costing.calc.profit'), rupiah(r.gross_profit)],
              [t('costing.calc.marginPercent'), `${fmt(r.margin_percent)}%`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl bg-muted/70 px-4 py-3">
                <dt className="text-xs text-muted-foreground">{k}</dt>
                <dd className="text-lg font-semibold tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max text-left text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr>
                  {[t('costing.calc.source'), t('costing.calc.material'), t('costing.calc.used'), t('costing.calc.unitCost'), t('costing.calc.lineCost')].map((h) => (
                    <th key={h} className="bg-muted px-4 py-2 font-medium first:rounded-l-2xl last:rounded-r-2xl">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {r.lines.map((l, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2">{l.source === 'service' ? r.service.name : l.source_name}</td>
                    <td className="px-4 py-2"><span className="font-mono text-xs">{l.sku}</span> {l.name}</td>
                    <td className="px-4 py-2 whitespace-nowrap tabular-nums">{fmt(l.qty_used)} {t(`materials.unit.${l.unit}`)}</td>
                    <td className="px-4 py-2 whitespace-nowrap tabular-nums">Rp {fmt(l.unit_cost)}</td>
                    <td className="px-4 py-2 whitespace-nowrap tabular-nums">Rp {fmt(l.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">{t('costing.calc.exactNote')}</p>
        </div>
      )}
    </section>
  );
}
