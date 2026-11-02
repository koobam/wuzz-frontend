import { Controller } from 'react-hook-form';
import { Power } from 'lucide-react';
import { Button, ChoiceCard, ErrorText, Field, FormActions, FormSection, Select, TextField } from '@wuzz/web-ui';
import { MATERIAL_CATEGORIES, MATERIAL_UNITS, type Material } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { usePublishFormActions } from '@/features/shell/components/form-header-actions';
import { useMaterialForm } from '../../hooks/use-material-form';

/** The form of the create / edit page that makes or edits a material: SKU, name, category, unit, what a purchase costs and holds. */
export function MaterialForm({ material, onSaved, onCancel }: { material?: Material; onSaved: (saved: Material) => void; onCancel: () => void }) {
  const { t } = useTranslation();
  const f = useMaterialForm(material, onSaved);
  usePublishFormActions({ formId: 'material-form', saving: f.saving, editing: !!material, onCancel });
  const { register, control, formState } = f.form;
  const { errors } = formState;

  return (
    <form id="material-form" noValidate className="space-y-4" onSubmit={f.submit}>
      <FormSection title={t('materials.form.sectionMaterial')} columns={2}>
        <TextField label={t('materials.form.sku')} required placeholder={t('materials.form.skuPlaceholder')} className="font-mono" maxLength={40} error={errors.sku?.message} {...register('sku')} />
        <TextField label={t('materials.form.name')} required placeholder={t('materials.form.namePlaceholder')} maxLength={80} error={errors.name?.message} {...register('name')} />
        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <Field label={t('materials.form.category')} required>
              {(id) => <Select inputId={id} shape="field" ariaLabel={t('materials.form.category')} className="w-full" value={field.value} onChange={field.onChange} options={MATERIAL_CATEGORIES.map((c) => ({ value: c, label: t(`materials.category.${c}`) }))} />}
            </Field>
          )}
        />
        <Controller
          control={control}
          name="unit"
          render={({ field }) => (
            <Field label={t('materials.form.unit')} required>
              {(id) => <Select inputId={id} shape="field" ariaLabel={t('materials.form.unit')} className="w-full" value={field.value} onChange={field.onChange} options={MATERIAL_UNITS.map((u) => ({ value: u, label: t(`materials.unit.${u}`) }))} />}
            </Field>
          )}
        />
        <TextField fieldClassName="sm:col-span-2" label={t('materials.form.notes')} placeholder={t('materials.form.notesPlaceholder')} error={errors.notes?.message} {...register('notes')} />
        <Controller
          control={control}
          name="active"
          render={({ field }) => (
            <ChoiceCard
              className="sm:col-span-2"
              checked={field.value}
              onChange={field.onChange}
              icon={<Power className="size-5" aria-hidden />}
              title={t('materials.form.activeTitle')}
              description={t('materials.form.activeDescription')}
            />
          )}
        />
      </FormSection>

      <FormSection title={t('materials.form.sectionPurchase')} description={t('materials.form.purchaseDescription')} columns={2}>
        <TextField label={t('materials.form.price')} required placeholder={t('materials.form.pricePlaceholder')} type="number" min={0} step={1} error={errors.purchase_price?.message} {...register('purchase_price', { valueAsNumber: true })} />
        <TextField label={`${t('materials.form.qty')} (${t(`materials.unit.${f.unit}`)})`} required inputMode="decimal" placeholder={t('materials.form.qtyPlaceholder')} hint={t('materials.form.qtyHint')} error={errors.purchase_qty?.message} {...register('purchase_qty')} />
      </FormSection>

      <ErrorText error={f.error} />
      <FormActions>
        <Button type="submit" variant="primary" disabled={f.saving}>{material ? t('common.save') : t('common.create')}</Button>
        <Button onClick={onCancel}>{t('common.cancel')}</Button>
      </FormActions>
    </form>
  );
}
