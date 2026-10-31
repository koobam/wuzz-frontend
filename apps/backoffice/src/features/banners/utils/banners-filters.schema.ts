import { z } from 'zod';

/** The filters of the banners list and their resting values: published or not, on a phone now or not, and the outlet it shows at (0 = any). */
export const bannersFiltersSchema = z.object({
  status: z.enum(['', 'active', 'inactive']).default(''),
  live: z.enum(['', 'true', 'false']).default(''),
  outlet: z.number().default(0),
});
