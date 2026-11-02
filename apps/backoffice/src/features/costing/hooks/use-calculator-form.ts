import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { ServiceCosting } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { useCalcCost } from '@/services/hooks/apis';
import { calculatorSchema, type CalculatorValues } from '../utils/calculator.schema';

/** The calculator: the question as a form (typed by the schema) and the exact answer from the server. */
export function useCalculatorForm(costing: ServiceCosting) {
  const { t } = useTranslation();
  const run = useCalcCost();
  const form = useForm<CalculatorValues>({ resolver: zodResolver(calculatorSchema(t)), defaultValues: { qty: '1', variants: {}, mods: [] }, mode: 'onChange' });

  const submit = form.handleSubmit((v) =>
    run.mutate({ service_id: costing.service.id, variant_option_ids: Object.values(v.variants).filter((id): id is number => id !== undefined), modifier_option_ids: v.mods, qty: v.qty }),
  );

  return { form, submit, result: run.data, pending: run.isPending, error: run.error };
}
