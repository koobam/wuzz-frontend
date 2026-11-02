import type { MaterialUnit } from '../materials/materials.types';

export type StockKind = 'receipt' | 'consumption' | 'consumption_reversal' | 'waste' | 'adjustment' | 'transfer_in' | 'transfer_out';

export type WasteReason = 'expired' | 'damaged' | 'spilled' | 'lost' | 'other';

export type StockRow = { outlet_id: number; material_id: number; sku: string; name: string; unit: MaterialUnit; qty: string; value: number; avg_cost: string; min_qty: string; low: boolean };

export type StockQuery = { outlet_id?: number; q?: string; low?: 'true' | ''; sort_by?: string; sort_dir?: 'asc' | 'desc'; limit?: number; offset?: number };

export type StockMovement = {
  id: number;
  outlet_id: number;
  material_id: number;
  sku: string;
  name: string;
  unit: MaterialUnit;
  kind: StockKind;
  reason: string;
  qty_delta: string;
  value_delta: number;
  balance_qty: string;
  balance_value: number;
  ref_type: string;
  ref_id: string;
  supplier: string;
  doc_no: string;
  note: string;
  created_by: string;
  created_at: string;
};

export type MovementQuery = { outlet_id?: number; material_id?: number; kind?: StockKind | ''; q?: string; from?: string; to?: string; sort_by?: string; sort_dir?: 'asc' | 'desc'; limit?: number; offset?: number };

/** A retried request must not book twice: the key makes it idempotent on the server. */
export type Keyed = { idempotency_key?: string };
