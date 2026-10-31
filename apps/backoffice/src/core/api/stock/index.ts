import { api, post, put, qs } from '@/core/http';
import type { Page } from '@/core/http';
import type { StockKind, WasteReason, StockRow, StockQuery, StockMovement, MovementQuery, Keyed } from './stock.types';

// Stock
// Per outlet and material: the quantity on hand (an exact decimal string), what it is worth in whole rupiah (a moving
// average, kept exact by the server), and an immutable history of movements.

export const WASTE_REASONS: WasteReason[] = ['expired', 'damaged', 'spilled', 'lost', 'other'];
export const STOCK_KINDS: StockKind[] = ['receipt', 'consumption', 'consumption_reversal', 'waste', 'adjustment', 'transfer_in', 'transfer_out'];

export const listStock = (p: StockQuery = {}, signal?: AbortSignal) => api<Page<StockRow>>(`/stock${qs(p)}`, { signal });

export const listMovements = (p: MovementQuery = {}, signal?: AbortSignal) => api<Page<StockMovement>>(`/stock/movements${qs(p)}`, { signal });

export const receiveStock = (b: { outlet_id: number; material_id: number; qty: string; total_cost: number; supplier?: string; doc_no?: string; note?: string } & Keyed) => post<StockMovement>('/stock/receipts', b);
export const wasteStock = (b: { outlet_id: number; material_id: number; qty: string; reason: WasteReason; note?: string } & Keyed) => post<StockMovement>('/stock/waste', b);
export const adjustStock = (b: { outlet_id: number; material_id: number; counted_qty: string; note: string } & Keyed) => post<StockMovement | null>('/stock/adjustments', b);
export const transferStock = (b: { from_outlet_id: number; to_outlet_id: number; material_id: number; qty: string; note?: string } & Keyed) => post<unknown>('/stock/transfers', b);
export const setStockMin = (b: { outlet_id: number; material_id: number; min_qty: string }) => put<StockRow>('/stock/min', b);
