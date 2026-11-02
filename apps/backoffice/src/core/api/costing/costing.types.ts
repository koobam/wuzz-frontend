import type { MaterialUnit } from '../materials/materials.types';

export type BomOwner = 'service' | 'variant_option' | 'modifier_option';

/** `unit`: per unit sold (it scales with the quantity); `line`: once per order line. */
export type BomPer = 'unit' | 'line';

export type BomLine = { material_id: number; sku: string; name: string; unit: MaterialUnit; qty: string; per: BomPer; loss_percent: string; unit_cost: string; cost: string };

export type Bom = { owner_type: BomOwner; owner_id: number; lines: BomLine[]; cost: string };

export type BomBody = { lines: { material_id: number; qty: string; per: BomPer; loss_percent: string }[] };

/** What one component (the service itself, or one option) costs: per unit sold, and once per order line. */
export type Cost = { per_unit: string; per_line: string };

export type ServiceCosting = {
  service: { id: number; name: string; unit: string; price: number };
  base: Cost & { lines: BomLine[] };
  variant_groups: { id: number; name: string; options: ({ id: number; name: string; price_delta: number } & Cost)[] }[];
  modifier_groups: { id: number; name: string; options: ({ id: number; name: string; price: number } & Cost)[] }[];
};

export type CalcBody = { service_id: number; variant_option_ids: number[]; modifier_option_ids: number[]; qty: string };

export type CalcResult = {
  service: { id: number; name: string; unit: string };
  qty: string;
  unit_price: number;
  revenue: number;
  lines: { source: 'service' | 'variant' | 'modifier'; source_name: string; material_id: number; sku: string; name: string; unit: MaterialUnit; per: BomPer; qty_used: string; unit_cost: string; cost: string }[];
  /** Whole rupiah: the exact sum of every line, rounded once. */
  cost: number;
  gross_profit: number;
  margin_percent: string;
};
