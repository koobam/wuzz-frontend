import { FormSection, Input, TextField } from '@wuzz/web-ui';
import type { ModifierGroup } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { useModifierForm } from '../../hooks/use-modifier-form';
import { GroupFormFrame } from '../group-form-frame';
import { OptionList, optionRowGrid } from '../option-list';
import { OptionRemoveButton } from '../option-remove-button';

/** The form of the create / edit page that makes or edits a modifier group: a name, notes, how many may be picked, and the add-ons with their prices. */
export function ModifierForm({ group, onSaved, onCancel }: { group?: ModifierGroup; onSaved: (saved: ModifierGroup) => void; onCancel: () => void }) {
  const { t } = useTranslation();
  const f = useModifierForm(group, onSaved);
  const { register, formState } = f.form;
  const { errors } = formState;

  return (
    <GroupFormFrame
      name={register('name')}
      notes={register('internal_notes')}
      nameError={errors.name?.message}
      editing={!!group}
      saving={f.saving}
      error={f.error}
      onSubmit={f.submit}
      onCancel={onCancel}
    >
      <FormSection title={t('groups.sectionRule')} columns={2}>
        <TextField label={t('groups.modifiers.min')} required placeholder={t('groups.modifiers.minPlaceholder')} type="number" min={0} hint={t('groups.modifiers.minHint')} error={errors.min?.message} {...register('min', { valueAsNumber: true })} />
        <TextField label={t('groups.modifiers.max')} type="number" min={1} placeholder={t('groups.modifiers.maxPlaceholder')} hint={t('groups.modifiers.maxHint')} error={errors.max?.message} {...register('max')} />
      </FormSection>

      <OptionList heads={[`${t('groups.optionName')} *`, `${t('groups.modifiers.price')} *`, t('groups.active')]} canAdd={f.canAdd} onAdd={f.add}>
        {f.rows.map((row, i) => (
          <div key={row.id} className={`grid items-start gap-2 sm:gap-3 ${optionRowGrid(false)}`}>
            <label className="min-w-0">
              <span className="mb-1 block text-xs text-muted-foreground sm:sr-only">{t('groups.optionName')}</span>
              <Input maxLength={80} placeholder={t('groups.optionNamePlaceholder')} invalid={!!errors.options?.[i]?.name} {...register(`options.${i}.name`)} />
            </label>
            <label className="min-w-0">
              <span className="mb-1 block text-xs text-muted-foreground sm:sr-only">{t('groups.modifiers.price')}</span>
              <Input type="number" min={0} step={500} placeholder={t('groups.modifiers.pricePlaceholder')} invalid={!!errors.options?.[i]?.price} {...register(`options.${i}.price`, { valueAsNumber: true })} />
            </label>
            <label className="flex items-center gap-2 text-sm sm:pt-3.5">
              <input type="checkbox" {...register(`options.${i}.active`)} /> <span className="sm:sr-only">{t('groups.active')}</span>
            </label>
            <span className="sm:pt-1.5">
              <OptionRemoveButton disabled={!f.canRemove} onClick={() => f.remove(i)} />
            </span>
          </div>
        ))}
      </OptionList>
    </GroupFormFrame>
  );
}
