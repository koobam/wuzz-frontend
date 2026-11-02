import request from '@http/request';
import { API_V1, apiUrl } from '@http/url';
import type { StringifiableRecord } from 'query-string';
import { BannersDataSchema } from './banners.types';
import type { BannersParams, BannersResponse } from './banners.types';

/**
 * The banners to show on the home carousel, in carousel order. GET /app/v1/banners
 *
 * The body is checked against the schema: a reply of the wrong shape is an error here,
 * not a carousel of half-empty slides.
 */
const readBanners = async (
  path: string,
  params?: BannersParams,
  signal?: AbortSignal,
): Promise<BannersResponse> => {
  const query: StringifiableRecord = {};
  if (params?.outlet_id != null) query.outlet_id = String(params.outlet_id);
  const res = await request<BannersResponse>(apiUrl(`${API_V1}${path}`, query), { signal });
  return { ...res, data: res.data == null ? null : BannersDataSchema.parse(res.data) };
};

export const banners = (params?: BannersParams, signal?: AbortSignal): Promise<BannersResponse> =>
  readBanners('/banners', params, signal);

/**
 * The banners of the login screen's carousel, in carousel order. GET /app/v1/login-banners
 *
 * A list of its own: a banner made for the home carousel is never in it. Public, as the login screen is seen before
 * anyone has signed in.
 */
export const loginBanners = (params?: BannersParams, signal?: AbortSignal): Promise<BannersResponse> =>
  readBanners('/login-banners', params, signal);
