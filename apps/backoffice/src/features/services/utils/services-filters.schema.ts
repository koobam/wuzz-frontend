import { z } from 'zod';

/** The filters of the services list and their resting values: the category (0 = every category), the unit, and whether the service is on sale. */
export const servicesFiltersSchema = z.object({
  category: z.number().default(0),
  unit: z.enum(['', 'kg', 'pcs', 'sesi', 'unit']).default(''),
  active: z.enum(['', 'true', 'false']).default(''),
});
