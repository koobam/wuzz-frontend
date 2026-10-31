import { z } from 'zod';

/** The filters of the stock list: only what is running low. Its resting value is "everything". */
export const stockFiltersSchema = z.object({
  low: z.boolean().default(false),
});
export type StockFilters = z.infer<typeof stockFiltersSchema>;
