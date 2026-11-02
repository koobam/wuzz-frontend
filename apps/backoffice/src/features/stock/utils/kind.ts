import type { StockKind } from '@/core/api';

export const STOCK_KIND_ORDER: StockKind[] = ['receipt', 'consumption', 'consumption_reversal', 'waste', 'adjustment', 'transfer_in', 'transfer_out'];

/** The colour of a movement's kind badge: stock coming in is green, waste red, a count correction amber. */
export const kindTone = (k: StockKind) => (k === 'receipt' || k === 'transfer_in' || k === 'consumption_reversal' ? 'good' : k === 'waste' ? 'bad' : k === 'adjustment' ? 'warn' : 'muted');
