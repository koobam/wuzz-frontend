import { z } from 'zod';

/** The filter over the customers table: status ('' = any). */
export const usersFiltersSchema = z.object({
  status: z.string().default(''),
});
