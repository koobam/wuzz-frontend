import { z } from 'zod';
import { defaultRange } from '@wuzz/web-ui';

/** What the dashboard can be narrowed by: the date range of the numbers, and the search and status of the latest orders. */
export const dashboardFiltersSchema = z.object({
  from: z.string().default(() => defaultRange().from),
  to: z.string().default(() => defaultRange().to),
  search: z.string().default(''),
  status: z.string().default(''),
});
export type DashboardFilters = z.infer<typeof dashboardFiltersSchema>;
export type DashboardFiltersInput = z.input<typeof dashboardFiltersSchema>;
