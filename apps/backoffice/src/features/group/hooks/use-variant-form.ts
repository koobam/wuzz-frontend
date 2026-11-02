import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import type { VariantGroup } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { useConfirmAction } from '@/services/hooks/use-confirm-action';
import { useSaveVariantGroup } from '@/services/hooks/apis';
import { blankVariant, blankVariantOption, variantBody, variantSchema, type VariantValues, variantValues } from '../utils/variant-form.schema';

const MAX_OPTIONS = 30;

/** The variant form: its values and rules, the rows of options (exactly one of them the default), and the save. */
export function useVariantForm(group: VariantGroup | undefined, onSaved: (saved: VariantGroup) => void) {
  const { t } = useTranslation();
  const ask = useConfirmAction();
  const form = useForm<VariantValues>({
    resolver: zodResolver(variantSchema(t)),
    defaultValues: group ? variantValues(group) : blankVariant(),
  });
  const rows = useFieldArray({ control: form.control, name: 'options' });
  const options = useWatch({ control: form.control, name: 'options' });
  const save = useSaveVariantGroup({ onSaved });

  return {
    form,
    rows: rows.fields,
    options,
    canAdd: rows.fields.length < MAX_OPTIONS,
    canRemove: rows.fields.length > 1,
    add: () => rows.append(blankVariantOption()),
    remove: rows.remove,
    setDefault: (i: number) => rows.fields.forEach((_, j) => form.setValue(`options.${j}.is_default`, j === i)),
    submit: form.handleSubmit(async (values) => {
      if (!(await ask.submit('variant', values.name, !!group))) return;
      save.mutate({ id: group?.id, ...variantBody(values) });
    }),
    saving: save.isPending,
    error: save.error,
  };
}
