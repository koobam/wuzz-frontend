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
export const banners = async (
  params?: BannersParams,
  signal?: AbortSignal,
): Promise<BannersResponse> => {
  const query: StringifiableRecord = {};
  if (params?.outlet_id != null) query.outlet_id = String(params.outlet_id);
  const res = await request<BannersResponse>(apiUrl(`${API_V1}/banners`, query), { signal });
  return { ...res, data: res.data == null ? null : BannersDataSchema.parse(res.data) };
};
