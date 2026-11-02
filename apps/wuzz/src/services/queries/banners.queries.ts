import { createQueryKeys } from '@lukemorales/query-key-factory';
import { banners, loginBanners } from '@api/banners';
import type { BannersParams } from '@api/banners.types';

export const BANNERS_QUERY_KEY = { base: 'banners', list: 'banners-list', loginList: 'banners-login-list' } as const;

export const bannersQueries = createQueryKeys(BANNERS_QUERY_KEY.base, {
  list: (params?: BannersParams) => ({
    queryKey: [BANNERS_QUERY_KEY.list, { ...params }],
    queryFn: ({ signal }) => banners(params, signal),
  }),
  loginList: (params?: BannersParams) => ({
    queryKey: [BANNERS_QUERY_KEY.loginList, { ...params }],
    queryFn: ({ signal }) => loginBanners(params, signal),
  }),
});
