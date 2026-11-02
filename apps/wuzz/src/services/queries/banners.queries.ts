import { createQueryKeys } from '@lukemorales/query-key-factory';
import { banners } from '@api/banners';
import type { BannersParams } from '@api/banners.types';

export const BANNERS_QUERY_KEY = { base: 'banners', list: 'banners-list' } as const;

export const bannersQueries = createQueryKeys(BANNERS_QUERY_KEY.base, {
  list: (params?: BannersParams) => ({
    queryKey: [BANNERS_QUERY_KEY.list, { ...params }],
    queryFn: ({ signal }) => banners(params, signal),
  }),
});
