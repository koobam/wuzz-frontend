import { z } from 'zod';

/** The filters of the variant list and their resting values: the service that uses the group, and whether any does. */
export const variantFiltersSchema = z.object({
  service: z.number().default(0),
  usage: z.enum(['', 'used', 'unused']).default(''),
});
