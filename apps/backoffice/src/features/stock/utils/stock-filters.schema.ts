import { z } from 'zod';

/** The filters over the stock table. Outlet 0 rests on the first outlet; -1 is every outlet. */
export const stockFiltersSchema = z.object({
  outlet: z.number().default(0),
  low: z.boolean().default(false),
});
