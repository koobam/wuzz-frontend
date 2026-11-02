import { z } from 'zod';
import type { ApiResponse } from '@http/response';

/** What a tap on the banner opens. A closed set, the same one the backend validates. */
export const BANNER_TARGET_TYPES = ['none', 'service', 'outlet', 'screen', 'external'] as const;
export type BannerTargetType = (typeof BANNER_TARGET_TYPES)[number];

/**
 * One live banner, as the server sends it. The server has already decided it is live
 * (active, inside its schedule, for this outlet), so nothing here filters again.
 */
export const BannerSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  title: z.string(),
  image_url: z.string().min(1),
  target_type: z.enum(BANNER_TARGET_TYPES),
  /** The service or outlet id, the screen key, or the URL; empty for `none`. */
  target_value: z.string().default(''),
  /** wuzz://service/{id}, wuzz://outlet/{id}, wuzz://screen/{key}, an https URL; empty for `none`. */
  deeplink: z.string().default(''),
});

export const BannersDataSchema = z.object({ banners: z.array(BannerSchema) });

export type Banner = z.infer<typeof BannerSchema>;
export type BannersData = z.infer<typeof BannersDataSchema>;
export type BannersResponse = ApiResponse<BannersData>;

export interface BannersParams {
  /** The outlet the customer picked; without it only banners for every outlet come back. */
  outlet_id?: number;
}
