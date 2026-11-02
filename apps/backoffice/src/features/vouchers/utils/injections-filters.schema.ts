import { z } from 'zod';

/** The one filter of the history of sends: a voucher (0 = any). */
export const injectionsFiltersSchema = z.object({ voucher: z.number().default(0) });
