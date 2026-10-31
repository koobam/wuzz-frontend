import { Controller, useWatch } from 'react-hook-form';
import { Power } from 'lucide-react';
import { Button, ChoiceCard, ErrorText, Field, rupiah, Select, Textarea, TextField } from '@wuzz/web-ui';
import { DISCOUNT_TYPES, SERVICE_UNITS, TAX_TYPES, type Service } from '@/core/api';
import { firstError } from '@/core/utils/form';
import { useTranslation } from '@/core/utils/i18n';
import { usePublishFormActions } from '@/features/shell/components/form-header-actions';
import { modifierRule } from '@/features/group/utils/modifier-rule';
import { useServiceForm } from '../../hooks/use-service-form';
import { priceBreakdown } from '../../utils/tax';
import { type ChecklistGroup, GroupChecklist } from '../group-checklist';

/** One figure of the price breakdown: read-only, drawn like a field so the row lines up with the inputs above it. */
function Sum({ label, value, hint, muted = false }: { label: string; value: string; hint?: string; muted?: boolean }) {
  return (
    <Field label={label} hint={hint}>
      {() => <p className={`rounded-xl border border-dashed border-input px-4 py-3 text-sm tabular-nums ${muted ? 'text-muted-foreground' : 'font-semibold'}`}>{value}</p>}
    </Field>
  );
}

const SECTION = 'space-y-4 rounded-3xl border border-border bg-card p-5';

/** The form of the create / edit page that makes or edits a service: the basics, the price with its tax, and the reusable groups it carries. */
export function ServiceForm({ service, onSaved, onCancel }: { service?: Service; onSaved: (saved: Service) => void; onCancel: () => void }) {
  const { t } = useTranslation();
  const f = useServiceForm(service, onSaved);
  usePublishFormActions({ formId: 'service-form', saving: f.saving, editing: !!service, onCancel });
  const { register, control, formState } = f.form;
  const { errors } = formState;
  const message = firstError(errors);

  const before = Number(useWatch({ control, name: 'price_before_tax' })) || 0;
  const taxType = useWatch({ control, name: 'tax_type' });
  const discountType = useWatch({ control, name: 'discount_type' });
  const discountInput = Number(useWatch({ control, name: 'discount_input' })) || 0;
  const rateBps = f.taxRates.find((r) => r.type === taxType)?.rate_bps ?? 0;
  const sum = priceBreakdown(before, discountType, discountType === 'percent' ? Math.round(discountInput * 100) : discountInput, rateBps);
  const taxLabel = (type: (typeof TAX_TYPES)[number]) =>
    type === 'none' ? t('services.form.taxNone') : t('services.form.taxPpn', { percent: (f.taxRates.find((r) => r.type === type)?.rate_bps ?? 0) / 100 });

  const variantChoices: ChecklistGroup[] = f.variantGroups.map((g) => ({
    id: g.id,
    name: g.name,
    notes: g.internal_notes,
    rule: t('services.picker.pickOne'),
    required: true,
    options: g.options.filter((o) => o.active).map((o) => ({ name: o.name, price: o.price_delta })),
  }));
  const modifierChoices: ChecklistGroup[] = f.modifierGroups.map((g) => ({
    id: g.id,
    name: g.name,
    notes: g.internal_notes,
    rule: modifierRule(t, g),
    required: g.min > 0,
    options: g.options.filter((o) => o.active).map((o) => ({ name: o.name, price: o.price })),
  }));

  return (
    <form id="service-form" noValidate className="space-y-5" onSubmit={f.submit}>
      <section className={SECTION}>
        <h2 className="text-sm font-semibold">{t('services.form.basics')}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <TextField fieldClassName="sm:col-span-2" label={t('services.form.name')} placeholder={t('services.form.namePlaceholder')} required maxLength={120} error={errors.name?.message} {...register('name')} />
          <Controller
            control={control}
            name="unit"
            render={({ field }) => (
              <Field label={t('services.form.unit')}>
                {() => <Select ariaLabel={t('services.form.unit')} className="w-full" value={field.value} onChange={field.onChange} options={SERVICE_UNITS.map((u) => ({ value: u, label: t(`unit.${u}`) }))} />}
              </Field>
            )}
          />
          <Controller
            control={control}
            name="category_id"
            render={({ field }) => (
              <Field label={t('services.form.category')}>
                {() => (
                  <Select
                    ariaLabel={t('services.form.category')}
                    className="w-full"
                    value={field.value}
                    onChange={field.onChange}
                    options={[{ value: 0, label: t('services.noCategory') }, ...f.categories.map((c) => ({ value: c.id, label: c.name }))]}
                  />
                )}
              </Field>
            )}
          />
          <Field className="sm:col-span-2 lg:col-span-4" label={t('services.form.internalNotes')} hint={t('services.form.internalNotesHint')} error={errors.internal_notes?.message}>
            {(id) => <Textarea id={id} maxLength={500} placeholder={t('services.form.notesPlaceholder')} invalid={!!errors.internal_notes} {...register('internal_notes')} />}
          </Field>
          {service && (
            <Controller
              control={control}
              name="active"
              render={({ field }) => (
                <ChoiceCard
                  className="sm:col-span-2 lg:col-span-4"
                  checked={field.value}
                  onChange={field.onChange}
                  icon={<Power className="size-5" aria-hidden />}
                  title={t('services.form.activeTitle')}
                  description={t('services.form.activeDescription')}
                />
              )}
            />
          )}
        </div>
      </section>

      <section className={SECTION}>
        <h2 className="text-sm font-semibold">{t('services.form.pricing')}</h2>
        <div className="grid gap-4 sm:grid-cols-[repeat(auto-fit,minmax(13rem,1fr))]">
          <TextField
            label={t('services.form.priceBeforeTax')}
            hint={t('services.form.priceBeforeTaxHint')}
            placeholder={t('services.form.pricePlaceholder')}
            required
            type="number"
            inputMode="numeric"
            min={0}
            step={500}
            error={errors.price_before_tax?.message}
            {...register('price_before_tax', { valueAsNumber: true })}
          />
          <Controller
            control={control}
            name="discount_type"
            render={({ field }) => (
              <Field label={t('services.form.discountType')}>
                {() => <Select ariaLabel={t('services.form.discountType')} className="w-full" value={field.value} onChange={field.onChange} options={DISCOUNT_TYPES.map((x) => ({ value: x, label: t(`services.form.discount.${x}`) }))} />}
              </Field>
            )}
          />
          {discountType !== 'none' && (
            <TextField
              label={discountType === 'percent' ? t('services.form.discountPercent') : t('services.form.discountValue')}
              hint={discountType === 'percent' ? t('services.form.discountPercentHint') : t('services.form.discountValueHint')}
              placeholder={discountType === 'percent' ? t('services.form.discountPercentPlaceholder') : t('services.form.discountValuePlaceholder')}
              type="number"
              inputMode="decimal"
              min={0}
              max={discountType === 'percent' ? 100 : undefined}
              step={discountType === 'percent' ? 0.5 : 500}
              error={errors.discount_input?.message}
              {...register('discount_input', { valueAsNumber: true })}
            />
          )}
          <Controller
            control={control}
            name="tax_type"
            render={({ field }) => (
              <Field label={t('services.form.taxType')}>
                {() => <Select ariaLabel={t('services.form.taxType')} className="w-full" value={field.value} onChange={field.onChange} options={TAX_TYPES.map((x) => ({ value: x, label: taxLabel(x) }))} />}
              </Field>
            )}
          />
        </div>
        <dl className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-4">
          <Sum label={t('services.form.discountAmount')} value={sum.discount > 0 ? `− ${rupiah(sum.discount)}` : rupiah(0)} muted />
          <Sum label={t('services.form.priceAfterDiscount')} value={rupiah(sum.afterDiscount)} muted />
          <Sum label={t('services.form.taxAmount')} value={rupiah(sum.tax)} muted />
          <Sum label={t('services.form.priceAfterTax')} hint={t('services.form.priceAfterTaxHint')} value={rupiah(sum.final)} />
        </dl>
      </section>

      <section className={SECTION}>
        <h2 className="text-sm font-semibold">{t('services.form.groupsTitle')}</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <Controller
            control={control}
            name="variant_group_ids"
            render={({ field }) => (
              <GroupChecklist kind="variant" title={t('services.picker.variants')} hint={t('services.picker.variantsHint')} empty={t('services.picker.variantsEmpty')} groups={variantChoices} value={field.value} onChange={field.onChange} />
            )}
          />
          <Controller
            control={control}
            name="modifier_group_ids"
            render={({ field }) => (
              <GroupChecklist kind="modifier" title={t('services.picker.modifiers')} hint={t('services.picker.modifiersHint')} empty={t('services.picker.modifiersEmpty')} groups={modifierChoices} value={field.value} onChange={field.onChange} />
            )}
          />
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="primary" disabled={f.saving}>{service ? t('common.save') : t('common.create')}</Button>
        <Button onClick={onCancel}>{t('common.cancel')}</Button>
        {message && <p role="alert" className="text-sm text-destructive">{message}</p>}
        <ErrorText error={f.error} />
      </div>
    </form>
  );
}
