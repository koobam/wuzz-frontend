import { isDecimal } from '@wuzz/web-ui';
import { z } from 'zod';
import { WASTE_REASONS, type StockRow } from '@/core/api';

export type StockAction = 'receipt' | 'waste' | 'adjustment' | 'transfer' | 'min';

/**
 * The form of one stock action. Quantities stay decimal strings (the server does the sums); only the cost of a receipt,
 * whole rupiah, becomes a number. What is required depends on the action: a transfer needs a destination, an
 * adjustment a note, and a receipt, waste or transfer a quantity above zero (a count or a minimum may be zero).
 */
export const stockSchema = (t: (key: string) => string, action: StockAction) =>
  z
    .object({
      qty: z.string(),
      cost: z.string(),
      supplier: z.string().max(80),
      docNo: z.string().max(40),
      note: z.string().max(200),
      reason: z.enum(WASTE_REASONS),
      to: z.number().nullable(),
    })
    .superRefine((v, ctx) => {
      const above = action !== 'adjustment' && action !== 'min';
      if (!isDecimal(v.qty, 4) || (above && Number(v.qty) <= 0)) ctx.addIssue({ code: 'custom', path: ['qty'], message: t('stock.form.invalidQty') });
      if (action === 'receipt' && !/^\d+$/.test(v.cost.trim())) ctx.addIssue({ code: 'custom', path: ['cost'], message: t('stock.form.invalidCost') });
      if (action === 'transfer' && v.to === null) ctx.addIssue({ code: 'custom', path: ['to'], message: t('stock.form.toOutlet') });
      if (action === 'adjustment' && v.note.trim() === '') ctx.addIssue({ code: 'custom', path: ['note'], message: t('stock.form.noteRequired') });
    });
export type StockValues = z.infer<ReturnType<typeof stockSchema>>;

/** What the sheet opens with: the counted quantity starts at the book quantity, the minimum at the current minimum. */
export const stockDefaults = (action: StockAction, row: StockRow): StockValues => ({
  qty: action === 'adjustment' ? row.qty : action === 'min' ? row.min_qty : '',
  cost: '0',
  supplier: '',
  docNo: '',
  note: '',
  reason: 'damaged',
  to: null,
});
