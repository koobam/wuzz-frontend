import { createQueryKeys } from '@lukemorales/query-key-factory';
import {
  laundryServices,
  laundryServiceDetail,
} from '@api/laundry-services';
import type { LaundryServicesParams } from '@api/laundry-services.types';
import { queryClient } from '@wuzz/native/query';

/**
 * Hasil prefetch hanya untuk pemuatan pertama (data belum ada). Kalau tetap
 * dikirim saat refetch, nitro-fetch bisa menjawab dari hasil prefetch lama dan
 * tidak pernah menghubungi server, jadi tarik-untuk-refresh tidak mengubah apa-apa.
 */
const prefetchKeyWhenCold = (queryKey: readonly unknown[], prefetchKey: string) =>
  queryClient.getQueryData(queryKey) === undefined ? prefetchKey : undefined;

export const LAUNDRY_SERVICES_QUERY_KEY = {
  base: 'laundryServices',
  regular: 'laundryServices-regular',
  alacarte: 'laundryServices-alacarte',
  detail: (id: string) => `laundryServiceDetail-${id}`,
} as const;

export const laundryServicesQueries = createQueryKeys(LAUNDRY_SERVICES_QUERY_KEY.base, {
  regular: (params?: LaundryServicesParams) => ({
    queryKey: [LAUNDRY_SERVICES_QUERY_KEY.regular],
    queryFn: ({ signal, queryKey }) =>
      laundryServices(
        'regular',
        params,
        prefetchKeyWhenCold(queryKey, LAUNDRY_SERVICES_QUERY_KEY.regular),
        signal,
      ),
  }),
  alacarte: (params?: LaundryServicesParams) => ({
    queryKey: [LAUNDRY_SERVICES_QUERY_KEY.alacarte],
    queryFn: ({ signal, queryKey }) =>
      laundryServices(
        'alacarte',
        params,
        prefetchKeyWhenCold(queryKey, LAUNDRY_SERVICES_QUERY_KEY.alacarte),
        signal,
      ),
  }),
  detail: (id: string) => ({
    queryKey: [LAUNDRY_SERVICES_QUERY_KEY.detail(id), id],
    queryFn: ({ signal, queryKey }) =>
      laundryServiceDetail(
        id,
        prefetchKeyWhenCold(queryKey, LAUNDRY_SERVICES_QUERY_KEY.detail(id)),
        signal,
      ),
  }),
});
