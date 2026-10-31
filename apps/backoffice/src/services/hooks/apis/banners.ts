import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createBanner, deleteBanner, reorderBanners, setBannerStatus, updateBanner } from '@/core/api';
import type { Banner, BannerBody, BannersParams, BannerStatus } from '@/core/api';
import { queries } from '@/services/queries';

/** One page of the banners list (searched, filtered, sorted by the server); the page before stays while the next loads. */
export const useBannerList = (params: BannersParams) => useQuery({ ...queries.banners.list(params), placeholderData: keepPreviousData });

/** Every banner in carousel order, for the order page. */
export const useOrderedBanners = () => useQuery(queries.banners.ordered);

/** The screens of the app a banner can open. */
export const useBannerScreens = () => useQuery(queries.banners.screens);

/** One banner by its id (0 = none asked for); `enabled` false stops it being fetched (a page whose banner has just been deleted). */
export const useBanner = (id: number, options?: { enabled?: boolean }) => useQuery({ ...queries.banners.detail(id), enabled: id > 0 && (options?.enabled ?? true) });

export type BannerDraft = BannerBody & { id?: number };

/** Creates the banner, or updates it when the draft has an id; every banner query is fetched again afterwards. */
export const useSaveBanner = (options?: { onSaved?: (saved: Banner) => void }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: BannerDraft) => (id ? updateBanner(id, body) : createBanner(body)),
    onSuccess: (saved) => {
      options?.onSaved?.(saved);
      return queryClient.invalidateQueries({ queryKey: queries.banners._def });
    },
  });
};

/** Turns a banner on or off. */
export const useSetBannerStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: BannerStatus }) => setBannerStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queries.banners._def }),
  });
};

/** Deletes a banner; `onDeleted` runs on success (a detail page leaves for the list). */
export const useDeleteBanner = (options?: { onDeleted?: () => void }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (b: Pick<Banner, 'id'>) => deleteBanner(b.id),
    onSuccess: (_done, b) => {
      // The banner is gone: forget its page's query first, or the page still open would fetch it again and meet a 404.
      queryClient.removeQueries({ queryKey: queries.banners.detail(b.id).queryKey });
      options?.onDeleted?.();
      // Only the lists: the other banners' pages are still right, and the deleted one's must not be fetched again.
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: queries.banners.list._def }),
        queryClient.invalidateQueries({ queryKey: queries.banners.ordered.queryKey }),
      ]);
    },
  });
};

/** Saves the carousel order. */
export const useReorderBanners = (options?: { onSaved?: () => void }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => reorderBanners(ids),
    onSuccess: () => {
      options?.onSaved?.();
      return queryClient.invalidateQueries({ queryKey: queries.banners._def });
    },
  });
};
