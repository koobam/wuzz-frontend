import { api, type Page, post, qs } from '@/core/http';
import type { MovementQuery, StockMovement, StockQuery, StockRow, WasteReason } from './stock.types';

// The outlet's stock, from the server. Quantities are exact decimals and travel as strings; money is whole rupiah.
// Stock is not kept offline: it is what the server says, and writes need a connection (the server also takes the sales'
// use of materials from the recipes, so the till never deducts anything itself).

export const WASTE_REASONS: WasteReason[] = ['expired', 'damaged', 'spilled', 'lost', 'other'];

export const listStock = (p: StockQuery = {}, signal?: AbortSignal) => api<Page<StockRow>>(`/stock${qs(p)}`, { signal });
export const listMovements = (p: MovementQuery = {}, signal?: AbortSignal) => api<Page<StockMovement>>(`/stock/movements${qs(p)}`, { signal });
/** The outlet is the till's own: the server pins it, so none is sent. A retry with the same key books once. */
export const receiveStock = (b: { material_id: number; qty: string; total_cost: number; supplier?: string; doc_no?: string; note?: string; idempotency_key: string }) => post<StockMovement>('/stock/receipts', b);
export const wasteStock = (b: { material_id: number; qty: string; reason: WasteReason; note?: string; idempotency_key: string }) => post<StockMovement>('/stock/waste', b);
