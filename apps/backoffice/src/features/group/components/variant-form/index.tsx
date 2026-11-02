import { Input } from '@wuzz/web-ui';
import type { VariantGroup } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { useVariantForm } from '../../hooks/use-variant-form';
import { GroupFormFrame } from '../group-form-frame';
import { OptionList, optionRowGrid } from '../option-list';
import { OptionRemoveButton } from '../option-remove-button';

/** The form of the create / edit page that makes or edits a variant group: a name, notes, and the options (one of them the default). */
export function VariantForm({ group, onSaved, onCancel }: { group?: VariantGroup; onSaved: (saved: VariantGroup) => void; onCancel: () => void }) {
  const { t } = useTranslation();
  const f = useVariantForm(group, onSaved);
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
      <OptionList heads={[`${t('groups.optionName')} *`, `${t('groups.variants.delta')} *`, t('groups.active')]} lead description={t('groups.variants.pickOneNote')} canAdd={f.canAdd} onAdd={f.add}>
        {f.rows.map((row, i) => (
          <div key={row.id} className={`grid items-start gap-2 sm:gap-3 ${optionRowGrid(true)}`}>
            <label className="flex items-center gap-2 text-xs sm:justify-center sm:pt-3.5" title={t('groups.variants.defaultHint')}>
              <input type="radio" name="default-option" checked={!!f.options[i]?.is_default} onChange={() => f.setDefault(i)} className="size-4 accent-[var(--ink)]" />
              <span className="sm:sr-only">{t('groups.variants.default')}</span>
            </label>
            <label className="min-w-0">
              <span className="mb-1 block text-xs text-muted-foreground sm:sr-only">{t('groups.optionName')}</span>
              <Input maxLength={80} placeholder={t('groups.optionNamePlaceholder')} invalid={!!errors.options?.[i]?.name} {...register(`options.${i}.name`)} />
            </label>
            <label className="min-w-0">
              <span className="mb-1 block text-xs text-muted-foreground sm:sr-only">{t('groups.variants.delta')}</span>
              <Input type="number" min={0} step={500} placeholder={t('groups.variants.deltaPlaceholder')} invalid={!!errors.options?.[i]?.price_delta} {...register(`options.${i}.price_delta`, { valueAsNumber: true })} />
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
