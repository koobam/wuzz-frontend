import { z } from 'zod';

/** The filters of the outlets list and their resting values: whether the outlet is open for business. */
export const outletsFiltersSchema = z.object({
  active: z.enum(['', 'true', 'false']).default(''),
});
