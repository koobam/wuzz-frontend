import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import type { ModifierGroup } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { useConfirmAction } from '@/services/hooks/use-confirm-action';
import { useSaveModifierGroup } from '@/services/hooks/apis';
import { blankModifier, blankModifierOption, modifierBody, modifierSchema, type ModifierValues, modifierValues } from '../utils/modifier-form.schema';

const MAX_OPTIONS = 30;

/** The modifier form: its values and rules, the rows of options, and the save. */
export function useModifierForm(group: ModifierGroup | undefined, onSaved: (saved: ModifierGroup) => void) {
  const { t } = useTranslation();
  const ask = useConfirmAction();
  const form = useForm<ModifierValues>({
    resolver: zodResolver(modifierSchema(t)),
    defaultValues: group ? modifierValues(group) : blankModifier(),
  });
  const rows = useFieldArray({ control: form.control, name: 'options' });
  const save = useSaveModifierGroup({ onSaved });

  return {
    form,
    rows: rows.fields,
    canAdd: rows.fields.length < MAX_OPTIONS,
    canRemove: rows.fields.length > 1,
    add: () => rows.append(blankModifierOption()),
    remove: rows.remove,
    submit: form.handleSubmit(async (values) => {
      if (!(await ask.submit('modifier', values.name, !!group))) return;
      save.mutate({ id: group?.id, ...modifierBody(values) });
    }),
    saving: save.isPending,
    error: save.error,
  };
}
