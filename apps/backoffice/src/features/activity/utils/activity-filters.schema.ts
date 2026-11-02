import { z } from 'zod';

/** The filters of the activity list: whether the request worked, what was done, and the search box (which `useServerTable` keeps itself). */
export const activityFiltersSchema = z.object({
  outcome: z.enum(['', 'ok', 'failed']).default(''),
  action: z.string().default(''),
});
export type ActivityFilters = z.infer<typeof activityFiltersSchema>;
