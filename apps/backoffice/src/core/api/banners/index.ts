import { api, del, patch, post, put, qs } from '@/core/http';
import type { Page } from '@/core/http';
import type { Banner, BannerBody, BannersParams, BannerStatus, BannerTargetType } from './banners.types';

export const BANNER_TARGETS: BannerTargetType[] = ['none', 'service', 'outlet', 'screen', 'external'];

/** One page of banners, searched, filtered and sorted by the server. */
export const listBannersPage = (p: BannersParams, signal?: AbortSignal) => api<Page<Banner>>(`/banners${qs(p)}`, { signal });

/** Every banner in carousel order (what the order page arranges). */
export const listAllBanners = (signal?: AbortSignal) => api<Page<Banner>>(`/banners${qs({ sort_by: 'sort_index', sort_dir: 'asc', limit: 100, offset: 0 })}`, { signal }).then((p) => p.items);

/** The screens of the app a banner can open (a closed set, kept by the server, which refuses any other key). */
export const listBannerScreens = (signal?: AbortSignal) => api<{ screens: string[] }>('/banners/screens', { signal }).then((r) => r.screens);

export const getBanner = (id: number, signal?: AbortSignal) => api<Banner>(`/banners/${id}`, { signal });
export const createBanner = (b: BannerBody) => post<Banner>('/banners', b);
export const updateBanner = (id: number, b: BannerBody) => put<Banner>(`/banners/${id}`, b);

/** Turns a banner on or off, changing nothing else about it. */
export const setBannerStatus = (id: number, status: BannerStatus) => patch<Banner>(`/banners/${id}`, { status });
export const deleteBanner = (id: number) => del<{ id: number }>(`/banners/${id}`);

/** Sets the carousel order: every banner's id, first to last. */
export const reorderBanners = (ids: number[]) => post<{ ids: number[] }>('/banners/reorder', { ids });
