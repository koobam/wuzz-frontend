export type MaterialCategory = 'chemical' | 'packaging' | 'consumable' | 'other';

/** The base unit every BOM quantity of the material is written in. */
export type MaterialUnit = 'ml' | 'g' | 'pcs' | 'sheet';

export type Material = {
  id: number;
  sku: string;
  name: string;
  category: MaterialCategory;
  unit: MaterialUnit;
  /** What `purchase_qty` base units cost, whole rupiah. The cost of one unit is the exact fraction price / qty. */
  purchase_price: number;
  purchase_qty: string;
  /** The same fraction as a decimal, rounded to 6 places for display only. */
  unit_cost: string;
  active: boolean;
  notes: string;
  /** In how many BOM lines it is used. */
  used_in: number;
  created_at: string;
  updated_at: string;
};

export type MaterialBody = { sku: string; name: string; category: MaterialCategory; unit: MaterialUnit; purchase_price: number; purchase_qty: string; active: boolean; notes: string };

export type MaterialQuery = { q?: string; category?: MaterialCategory | ''; active?: 'true' | 'false' | ''; sort_by?: string; sort_dir?: 'asc' | 'desc'; limit?: number; offset?: number };
