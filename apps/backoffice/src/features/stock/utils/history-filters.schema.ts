import { z } from 'zod';
import { STOCK_KINDS } from '@/core/api';

/** The filters over the stock ledger: the outlet (0 = every outlet), the kind of movement ('' = any) and a range of days ('' = unbounded). */
export const historyFiltersSchema = z.object({
  outlet: z.number().default(0),
  kind: z.enum(['', ...STOCK_KINDS]).default(''),
  from: z.string().default(''),
  to: z.string().default(''),
});
