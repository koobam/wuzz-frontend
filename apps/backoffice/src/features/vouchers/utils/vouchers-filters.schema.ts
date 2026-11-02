import { z } from 'zod';

/** The filters of the vouchers list and their resting values: published or not, where its window stands, the kind of discount, and the outlet (0 = any). */
export const vouchersFiltersSchema = z.object({
  status: z.enum(['', 'active', 'inactive']).default(''),
  period: z.enum(['', 'running', 'upcoming', 'ended', 'unlimited']).default(''),
  discount: z.enum(['', 'percentage', 'amount']).default(''),
  outlet: z.number().default(0),
});
