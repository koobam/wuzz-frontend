import { z } from 'zod';
import { isDecimal } from '@wuzz/web-ui';
import { WASTE_REASONS } from '@/core/api';

/**
 * What the stock form holds, for both of its actions (waste and receipt). The quantity is an exact decimal and stays
 * a string, so it is never turned into a float; the cost is whole rupiah.
 */
export const stockSchema = (invalidQty: string) =>
  z.object({
    qty: z.string().refine((v) => isDecimal(v, 4) && Number(v) > 0, invalidQty),
    reason: z.enum(WASTE_REASONS as [string, ...string[]]),
    cost: z.number().int().min(0),
    supplier: z.string().max(80),
    docNo: z.string().max(40),
    note: z.string().max(200),
  });
export type StockValues = z.infer<ReturnType<typeof stockSchema>>;

export const STOCK_DEFAULTS: StockValues = { qty: '', reason: 'damaged', cost: 0, supplier: '', docNo: '', note: '' };
