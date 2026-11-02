import { createQueryKeys } from '@lukemorales/query-key-factory';
import { getBanner, listAllBanners, listBannerScreens, listBannersPage } from '@/core/api';
import type { BannersParams } from '@/core/api';

export const bannersQueries = createQueryKeys('banners', {
  list: (params: BannersParams) => ({
    queryKey: [params],
    queryFn: ({ signal }) => listBannersPage(params, signal),
  }),
  ordered: {
    queryKey: null,
    queryFn: ({ signal }) => listAllBanners(signal),
  },
  screens: {
    queryKey: null,
    queryFn: ({ signal }) => listBannerScreens(signal),
  },
  detail: (id: number) => ({
    queryKey: [id],
    queryFn: ({ signal }) => getBanner(id, signal),
  }),
});
