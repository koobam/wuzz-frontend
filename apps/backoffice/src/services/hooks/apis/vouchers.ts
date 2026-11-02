import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createVoucher, deleteVoucher, sendVoucher, setVoucherStatus, updateVoucher } from '@/core/api';
import type { HoldersParams, InjectionBody, InjectionsParams, Voucher, VoucherBody, VouchersParams, VoucherStatus } from '@/core/api';
import { queries } from '@/services/queries';

/** One page of the vouchers list (searched, filtered, sorted by the server); the page before stays while the next loads. */
export const useVoucherList = (params: VouchersParams) => useQuery({ ...queries.vouchers.list(params), placeholderData: keepPreviousData });

/** Every voucher that is switched on, for the send page. */
export const useActiveVouchers = () => useQuery(queries.vouchers.active);

/** One voucher by its id (0 = none asked for); `enabled` false stops it being fetched (a page whose voucher has just been deleted). */
export const useVoucher = (id: number, options?: { enabled?: boolean }) => useQuery({ ...queries.vouchers.detail(id), enabled: id > 0 && (options?.enabled ?? true) });

/** The customers holding a voucher, one page. */
export const useVoucherHolders = (id: number, params: HoldersParams) => useQuery({ ...queries.vouchers.holders(id, params), enabled: id > 0, placeholderData: keepPreviousData });

export type VoucherDraft = VoucherBody & { id?: number };

/** Creates the voucher, or updates it when the draft has an id; every voucher query is fetched again afterwards. */
export const useSaveVoucher = (options?: { onSaved?: (saved: Voucher) => void }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: VoucherDraft) => (id ? updateVoucher(id, body) : createVoucher(body)),
    onSuccess: (saved) => {
      options?.onSaved?.(saved);
      return queryClient.invalidateQueries({ queryKey: queries.vouchers._def });
    },
  });
};

/** Turns a voucher on or off. */
export const useSetVoucherStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: VoucherStatus }) => setVoucherStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queries.vouchers._def }),
  });
};

/** Deletes a voucher; `onDeleted` runs on success (a detail page leaves for the list). */
export const useDeleteVoucher = (options?: { onDeleted?: () => void }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (v: Pick<Voucher, 'id'>) => deleteVoucher(v.id),
    onSuccess: (_done, v) => {
      // The voucher is gone: forget its page's queries first, or the page still open would fetch it again and meet a 404.
      queryClient.removeQueries({ queryKey: queries.vouchers.detail(v.id).queryKey });
      options?.onDeleted?.();
      return Promise.all([queryClient.invalidateQueries({ queryKey: queries.vouchers.list._def }), queryClient.invalidateQueries({ queryKey: queries.vouchers.active.queryKey })]);
    },
  });
};

/** The history of sends, one page (all of them, or one voucher's). */
export const useInjections = (params: InjectionsParams) => useQuery({ ...queries.injections.list(params), placeholderData: keepPreviousData });

/** Sends a voucher to some customers; the history and the voucher's counts are fetched again afterwards. */
export const useSendVoucher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ voucherId, ...b }: InjectionBody & { voucherId: number }) => sendVoucher(voucherId, b),
    onSuccess: () => Promise.all([queryClient.invalidateQueries({ queryKey: queries.injections._def }), queryClient.invalidateQueries({ queryKey: queries.vouchers._def })]),
  });
};
