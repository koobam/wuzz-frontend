import { z } from 'zod';

/** Who the order is for: a name is required (the till will not save without one), a phone number is optional. */
export const customerSchema = z.object({
  name: z.string().trim().min(1),
  phone: z.string().trim(),
});
export type CustomerValues = z.infer<typeof customerSchema>;
