import { createQueryKeys } from '@lukemorales/query-key-factory';
import { getVoucher, listActiveVouchers, listInjections, listVoucherHolders, listVouchersPage } from '@/core/api';
import type { HoldersParams, InjectionsParams, VouchersParams } from '@/core/api';

export const vouchersQueries = createQueryKeys('vouchers', {
  list: (params: VouchersParams) => ({
    queryKey: [params],
    queryFn: ({ signal }) => listVouchersPage(params, signal),
  }),
  active: {
    queryKey: null,
    queryFn: ({ signal }) => listActiveVouchers(signal),
  },
  detail: (id: number) => ({
    queryKey: [id],
    queryFn: ({ signal }) => getVoucher(id, signal),
  }),
  holders: (id: number, params: HoldersParams) => ({
    queryKey: [id, params],
    queryFn: ({ signal }) => listVoucherHolders(id, params, signal),
  }),
});

export const injectionsQueries = createQueryKeys('injections', {
  list: (params: InjectionsParams) => ({
    queryKey: [params],
    queryFn: ({ signal }) => listInjections(params, signal),
  }),
});
