import { Plus, Trash2 } from 'lucide-react';
import { Controller } from 'react-hook-form';
import { Button, ErrorText, Field, formatDecimal, Input, roundTo, Select } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import type { BomOwner, BomPer } from '@/core/api';
import { useBomForm } from '../../hooks/use-bom-form';

const GRID = 'md:grid-cols-[minmax(0,1fr)_9rem_14rem_6rem_7rem_2.25rem]';
const headerCell = 'text-xs font-medium text-muted-foreground';

/**
 * The recipe of one thing (a service, a variant option, a modifier option): which materials it uses and how much of each,
 * per unit sold or once per order line, with a standard loss. Quantities stay decimal strings; the server does the sums.
 */
export function BomEditor({ owner, id, title, hint, unit, onSaved }: { owner: BomOwner; id: number; title: string; hint?: string; unit: string; onSaved: () => void }) {
  const { t, i18n } = useTranslation();
  const { form, lines, addLine, submit, materials, materialOf, savedCost, saving, saved, saveError, error } = useBomForm({ owner, id, name: title, onSaved });
  const { register, control, formState } = form;
  const rows = lines.fields;

  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground">{hint ?? t('costing.bom.help')}</p>
      </div>
      <ErrorText error={error} />
      {rows.length === 0 && <p className="rounded-2xl bg-muted/70 px-4 py-3 text-sm text-muted-foreground">{t('costing.none')}</p>}
      {rows.length > 0 && (
        <div className={`hidden gap-3 px-0.5 md:grid ${GRID}`} aria-hidden>
          <span className={headerCell}>{t('costing.bom.headers.material')}</span>
          <span className={headerCell}>{t('costing.bom.headers.qty')}</span>
          <span className={headerCell}>{t('costing.bom.headers.per')}</span>
          <span className={headerCell} title={t('costing.bom.lossHint')}>{t('costing.bom.headers.loss')}</span>
          <span className={`${headerCell} text-right`}>{t('costing.bom.headers.cost')}</span>
          <span />
        </div>
      )}
      <form onSubmit={submit} className="space-y-4">
        {rows.map((row, i) => {
          const materialId = form.watch(`lines.${i}.material_id`);
          const cost = savedCost(materialId);
          const material = materialOf(materialId);
          return (
            <div key={row.id} className={`grid items-start gap-2 md:gap-3 ${GRID}`}>
              <Controller
                control={control}
                name={`lines.${i}.material_id`}
                render={({ field }) => (
                  <Field label={t('costing.bom.material')} className="md:[&>label]:sr-only">
                    {(fid) => (
                  <Select
                    inputId={fid}
                    shape="field"
                    ariaLabel={t('costing.bom.material')}
                    className="w-full"
                    searchable
                    placeholder={t('costing.bom.pickMaterial')}
                    value={field.value || null}
                    onChange={field.onChange}
                    options={materials.map((m) => ({ value: m.id, label: `${m.name} · ${m.sku}` }))}
                  />
                    )}
                  </Field>
                )}
              />
              <label className="min-w-0">
                <span className="mb-1 block text-xs text-muted-foreground md:sr-only">{t('costing.bom.qty')}</span>
                <span className="flex items-center gap-2">
                  <Input inputMode="decimal" placeholder={t('costing.bom.qtyPlaceholder')} {...register(`lines.${i}.qty`)} />
                  <span className="w-8 shrink-0 text-xs text-muted-foreground">{material ? t(`materials.unit.${material.unit}`) : ''}</span>
                </span>
              </label>
              <Controller
                control={control}
                name={`lines.${i}.per`}
                render={({ field }) => (
                  <Field label={t('costing.bom.per')} className="md:[&>label]:sr-only">
                    {(fid) => (
                      <Select
                        inputId={fid}
                        shape="field"
                        ariaLabel={t('costing.bom.per')}
                        className="w-full"
                        value={field.value}
                        onChange={field.onChange}
                        options={[
                          { value: 'unit' as BomPer, label: t('costing.bom.perUnit', { unit }) },
                          { value: 'line' as BomPer, label: t('costing.bom.perLine') },
                        ]}
                      />
                    )}
                  </Field>
                )}
              />
              <label className="min-w-0" title={t('costing.bom.lossHint')}>
                <span className="mb-1 block text-xs text-muted-foreground md:sr-only">{t('costing.bom.loss')}</span>
                <span className="flex items-center gap-1.5">
                  <Input inputMode="decimal" placeholder={t('costing.bom.lossPlaceholder')} {...register(`lines.${i}.loss_percent`)} />%
                </span>
              </label>
              <span className="text-right text-sm text-muted-foreground tabular-nums md:pt-3">{cost ? `Rp ${formatDecimal(roundTo(cost, 2), i18n.language)}` : ''}</span>
              <button type="button" onClick={() => lines.remove(i)} aria-label={t('costing.bom.remove')} title={t('costing.bom.remove')} className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-accent md:mt-1.5">
                <Trash2 className="size-4" />
              </button>
            </div>
          );
        })}
        <div className="flex flex-wrap items-center gap-2">
          <Button className="inline-flex items-center gap-1.5" disabled={rows.length >= 40} onClick={addLine}>
            <Plus className="size-4" /> {t('costing.bom.add')}
          </Button>
          <Button type="submit" variant="primary" disabled={!formState.isValid || saving}>{t('costing.bom.save')}</Button>
          {saved && <span className="text-xs text-muted-foreground">{t('costing.bom.saved')}</span>}
        </div>
        {!formState.isValid && rows.length > 0 && <p className="text-xs text-muted-foreground">{t('costing.bom.invalid')}</p>}
        <ErrorText error={saveError} />
      </form>
    </section>
  );
}
