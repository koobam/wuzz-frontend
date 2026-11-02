import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Voucher } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { useOutlets, useSaveVoucher, useServices } from '@/services/hooks/apis';
import { useConfirmAction } from '@/services/hooks/use-confirm-action';
import { blankVoucher, voucherBody, voucherSchema, type VoucherValues, voucherValues } from '../utils/voucher-form.schema';

/** The voucher form: its values and rules, what its pickers offer (outlets, services), and the save. */
export function useVoucherForm(voucher: Voucher | undefined, onSaved: (saved: Voucher) => void) {
  const { t } = useTranslation();
  const ask = useConfirmAction();
  const form = useForm<VoucherValues>({
    resolver: zodResolver(voucherSchema(t)),
    defaultValues: voucher ? voucherValues(voucher) : blankVoucher(),
  });
  const services = useServices();
  const outlets = useOutlets();
  const save = useSaveVoucher({ onSaved });
  // A picture still going up is not part of the voucher yet: saving waits for it.
  const [uploading, setUploading] = useState(false);

  return {
    form,
    services: services.data ?? [],
    outlets: outlets.data ?? [],
    pickersError: services.error ?? outlets.error,
    pickersLoading: services.isPending || outlets.isPending,
    uploading,
    setUploading,
    submit: form.handleSubmit(async (values) => {
      if (!(await ask.submit('voucher', values.title, !!voucher))) return;
      save.mutate({ id: voucher?.id, ...voucherBody(values) });
    }),
    saving: save.isPending,
    error: save.error,
  };
}
