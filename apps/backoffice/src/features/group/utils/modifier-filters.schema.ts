import { z } from 'zod';

/** The filters of the modifier list and their resting values: as the variants', plus whether the group has to be picked. */
export const modifierFiltersSchema = z.object({
  service: z.number().default(0),
  usage: z.enum(['', 'used', 'unused']).default(''),
  requirement: z.enum(['', 'required', 'optional']).default(''),
});
