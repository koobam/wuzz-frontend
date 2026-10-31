import type { StockKind } from '@/core/api';

export const kindTone = (k: StockKind) =>
  k === 'receipt' || k === 'transfer_in' || k === 'consumption_reversal' ? 'good' : k === 'waste' ? 'bad' : k === 'adjustment' ? 'warn' : 'muted';
