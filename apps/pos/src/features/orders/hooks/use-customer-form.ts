import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { customerSchema, type CustomerValues } from '../utils/customer.schema';

/** The customer fields of a new order. `valid` is whether the name is filled in; `values()` is what to save, trimmed. */
export function useCustomerForm() {
  const form = useForm<CustomerValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: '', phone: '' },
    mode: 'onChange',
  });
  return {
    form,
    valid: form.formState.isValid,
    values: () => customerSchema.parse(form.getValues()),
    clear: () => form.reset(),
  };
}
