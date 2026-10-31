import { z } from 'zod';

/** The filters over the admins and staff tables: status ('' = any) and outlet (0 = every outlet). */
export const accountsFiltersSchema = z.object({
  status: z.string().default(''),
  outlet: z.number().default(0),
});
