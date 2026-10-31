import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import type { Material } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { useConfirmAction } from '@/services/hooks/use-confirm-action';
import { useSaveMaterial } from '@/services/hooks/apis';
import { blankMaterial, materialBody, materialSchema, type MaterialValues, materialValues } from '../utils/material-form.schema';

/** The material form: its values and rules, the unit its quantity is counted in, and the save. */
export function useMaterialForm(material: Material | undefined, onSaved: (saved: Material) => void) {
  const { t } = useTranslation();
  const ask = useConfirmAction();
  const form = useForm<MaterialValues>({
    resolver: zodResolver(materialSchema(t)),
    defaultValues: material ? materialValues(material) : blankMaterial(),
  });
  const unit = useWatch({ control: form.control, name: 'unit' });
  const save = useSaveMaterial({ onSaved });

  return {
    form,
    unit,
    submit: form.handleSubmit(async (values) => {
      if (!(await ask.submit('material', values.name, !!material))) return;
      save.mutate({ id: material?.id, ...materialBody(values) });
    }),
    saving: save.isPending,
    error: save.error,
  };
}
