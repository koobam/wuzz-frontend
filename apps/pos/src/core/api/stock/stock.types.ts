export type MaterialUnit = 'ml' | 'g' | 'pcs' | 'sheet';
export type StockRow = { outlet_id: number; material_id: number; sku: string; name: string; unit: MaterialUnit; qty: string; value: number; avg_cost: string; min_qty: string; low: boolean };
export type StockKind = 'receipt' | 'consumption' | 'consumption_reversal' | 'waste' | 'adjustment' | 'transfer_in' | 'transfer_out';
export type WasteReason = 'expired' | 'damaged' | 'spilled' | 'lost' | 'other';

export type StockMovement = {
  id: number;
  material_id: number;
  sku: string;
  name: string;
  unit: MaterialUnit;
  kind: StockKind;
  reason: string;
  qty_delta: string;
  value_delta: number;
  balance_qty: string;
  note: string;
  supplier: string;
  doc_no: string;
  created_by: string;
  created_at: string;
};

export type StockQuery = { q?: string; low?: 'true' | ''; limit?: number; offset?: number };
export type MovementQuery = { kind?: StockKind | ''; limit?: number; offset?: number };
