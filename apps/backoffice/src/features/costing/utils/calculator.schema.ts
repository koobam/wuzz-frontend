import { isDecimal } from '@wuzz/web-ui';
import { z } from 'zod';

/** The question put to the calculator: how many units, which option of each variant group (by group id), and which modifiers. */
export const calculatorSchema = (t: (key: string) => string) =>
  z.object({
    qty: z.string().refine((v) => isDecimal(v, 4) && Number(v) > 0, t('costing.calc.invalidQty')),
    variants: z.record(z.string(), z.number().optional()),
    mods: z.array(z.number()),
  });
export type CalculatorValues = z.infer<ReturnType<typeof calculatorSchema>>;
