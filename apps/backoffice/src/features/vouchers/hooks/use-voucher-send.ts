import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useDebounced } from '@wuzz/web-ui';
import type { Injection } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { useActiveVouchers, useSendVoucher, useUsers } from '@/services/hooks/apis';
import { useConfirmAction } from '@/services/hooks/use-confirm-action';
import { summarizePhones } from '../utils/phones';
import { blankSend, extraPhones, recipientCount, type Recipient, voucherSendSchema, type VoucherSendValues } from '../utils/voucher-send.schema';

/**
 * The send form: the voucher, the pasted numbers (checked as they are typed), the customers picked from a search, the
 * confirmation and the send. What came of the last send stays in `result` until another one starts.
 */
export function useVoucherSend(initialVoucher: number) {
  const { t } = useTranslation();
  const ask = useConfirmAction();
  const form = useForm<VoucherSendValues>({ resolver: zodResolver(voucherSendSchema(t)), defaultValues: blankSend(initialVoucher) });
  const vouchers = useActiveVouchers();
  const send = useSendVoucher();
  const [result, setResult] = useState<Injection | null>(null);
  const [search, setSearch] = useState('');
  const q = useDebounced(search.trim());
  const customers = useUsers({ query: q || undefined, status: 'active', limit: 8, offset: 0 });

  const w = useWatch({ control: form.control });
  const picked = (w.customers ?? []) as Recipient[];
  const summary = summarizePhones(w.phones_text ?? '');
  const total = recipientCount(summary.phones, picked);
  const voucher = vouchers.data?.find((v) => v.id === w.voucher_id);

  const pick = (c: Recipient) => {
    if (picked.some((p) => p.id === c.id)) return;
    form.setValue('customers', [...picked, c], { shouldDirty: true, shouldValidate: form.formState.isSubmitted });
  };
  const unpick = (id: string) => form.setValue('customers', picked.filter((p) => p.id !== id), { shouldDirty: true, shouldValidate: form.formState.isSubmitted });

  return {
    form,
    vouchers: vouchers.data ?? [],
    vouchersLoading: vouchers.isPending,
    vouchersError: vouchers.error,
    voucher,
    summary,
    total,
    picked,
    pick,
    unpick,
    search,
    setSearch,
    found: customers.data?.items ?? [],
    searching: customers.isFetching,
    searchError: customers.error,
    result,
    sending: send.isPending,
    error: send.error,
    submit: form.handleSubmit(async (values) => {
      const target = vouchers.data?.find((v) => v.id === values.voucher_id);
      const phones = extraPhones(summarizePhones(values.phones_text).phones, values.customers);
      if (!target || !(await ask.sendVoucher(target.title, values.customers.length + phones.length))) return;
      setResult(null);
      send.mutate(
        { voucherId: values.voucher_id, phones, customer_ids: values.customers.map((c) => c.id) },
        {
          onSuccess: (done) => {
            setResult(done);
            form.reset(blankSend(values.voucher_id));
            setSearch('');
          },
        },
      );
    }),
  };
}
