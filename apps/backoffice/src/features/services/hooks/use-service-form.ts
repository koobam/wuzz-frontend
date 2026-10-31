import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { Service } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { useConfirmAction } from '@/services/hooks/use-confirm-action';
import { useAllModifierGroups, useAllVariantGroups, useSaveService, useServiceCategories, useTaxRates } from '@/services/hooks/apis';
import { blankService, serviceBody, serviceSchema, type ServiceValues, serviceValues } from '../utils/service-form.schema';

/** The service form: its values and rules, what its pickers offer (categories, the reusable groups), and the save. */
export function useServiceForm(service: Service | undefined, onSaved: (saved: Service) => void) {
  const { t } = useTranslation();
  const ask = useConfirmAction();
  const form = useForm<ServiceValues>({
    resolver: zodResolver(serviceSchema(t)),
    defaultValues: service ? serviceValues(service) : blankService(),
  });
  const categories = useServiceCategories();
  const variantGroups = useAllVariantGroups();
  const modifierGroups = useAllModifierGroups();
  const taxRates = useTaxRates();
  const save = useSaveService({ onSaved });

  return {
    form,
    categories: categories.data ?? [],
    taxRates: taxRates.data ?? [],
    variantGroups: variantGroups.data ?? [],
    modifierGroups: modifierGroups.data ?? [],
    submit: form.handleSubmit(async (values) => {
      if (!(await ask.submit('service', values.name, !!service))) return;
      save.mutate({ id: service?.id, ...serviceBody(values) });
    }),
    saving: save.isPending,
    error: save.error,
  };
}
