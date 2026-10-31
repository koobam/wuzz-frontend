import { z } from 'zod';

/** The filters of the materials list and their resting values: the category, and whether the material is active. */
export const materialsFiltersSchema = z.object({
  category: z.enum(['', 'chemical', 'packaging', 'consumable', 'other']).default(''),
  active: z.enum(['', 'true', 'false']).default(''),
});
