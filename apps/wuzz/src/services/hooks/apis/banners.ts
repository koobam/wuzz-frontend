import type { BannersParams, BannersResponse } from '@api/banners.types';
import queries from '@services/queries';
import { useQuery } from '@tanstack/react-query';

/** The live window moves with the clock, so the list is re-read after a minute rather than the app default. */
const BANNERS_STALE_TIME_MS = 60 * 1000;

export const useFetchBanners = (params?: BannersParams) => {
  return useQuery({
    ...queries.banners.list(params),
    staleTime: BANNERS_STALE_TIME_MS,
    // Off in the app default; on here so coming back to the app re-reads a stale list.
    refetchOnWindowFocus: true,
    select: (data: BannersResponse) => data.data?.banners ?? [],
  });
};
