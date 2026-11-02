import { isDecimal } from '@wuzz/web-ui';
import { z } from 'zod';

/**
 * The recipe of one thing, as typed. Quantities and the loss stay decimal strings (the server does the sums): a line needs a
 * material, a quantity above zero with at most 4 decimals, and a loss of 0 to 100 percent with at most 2.
 */
export const bomSchema = (t: (key: string) => string) =>
  z.object({
    lines: z
      .array(
        z.object({
          material_id: z.number().int().positive(t('costing.bom.pickMaterial')),
          qty: z.string().refine((v) => isDecimal(v, 4) && Number(v) > 0, t('costing.bom.invalid')),
          per: z.enum(['unit', 'line']),
          loss_percent: z.string().refine((v) => isDecimal(v || '0', 2) && Number(v || '0') <= 100, t('costing.bom.invalid')),
        }),
      )
      .max(40),
  });
export type BomValues = z.infer<ReturnType<typeof bomSchema>>;

export const blankLine: BomValues['lines'][number] = { material_id: 0, qty: '', per: 'unit', loss_percent: '0' };
