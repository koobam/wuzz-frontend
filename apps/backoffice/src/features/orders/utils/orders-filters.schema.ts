import { z } from 'zod';

/** The filters of the orders list and their resting values; the date range is two of them (from, to), both empty for every order. */
export const ordersFiltersSchema = z.object({
  status: z.string().default(''),
  outlet: z.number().default(0),
  from: z.string().default(''),
  to: z.string().default(''),
});
