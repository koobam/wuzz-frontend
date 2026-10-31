import type { VariantGroup, ModifierGroup } from '../groups/groups.types';

/** What a service is priced per: weight, a piece, a machine session, a vehicle. */
export type ServiceUnit = 'kg' | 'pcs' | 'sesi' | 'unit';

/** How tax is added to a service's price: not at all, or value-added tax on top. */
export type TaxType = 'none' | 'ppn';

/** How a discount is taken off the base price: not at all, a fixed amount in rupiah, or a percentage (stored in basis points, 1250 = 12.5%). */
export type DiscountType = 'none' | 'value' | 'percent';

/** A tax type and its rate in basis points (1100 = 11%). */
export type TaxRate = { type: TaxType; rate_bps: number };

export type Service = {
  id: number;
  name: string;
  unit: ServiceUnit;
  /** What the customer pays (= `price_after_tax`). */
  price: number;
  /** What staff type: the price before tax. The server adds the tax and rounds once. */
  price_before_tax: number;
  discount_type: DiscountType;
  /** Whole rupiah for `value`, basis points for `percent`, 0 for `none`. */
  discount_value: number;
  /** What the discount takes off, in rupiah (computed by the server). */
  discount_amount: number;
  /** The base price less the discount: what the tax is worked out on. */
  price_after_discount: number;
  price_after_tax: number;
  tax_type: TaxType;
  tax_rate_bps: number;
  internal_notes: string;
  active: boolean;
  /** The category it is listed under (0 = none), and the name of the icon it is drawn with. */
  category_id: number;
  icon: string;
  description: string;
  /** The variant groups (pick one option each; the option's price is added) and the modifier groups (add-ons, with a min and a max) this service uses, in order. */
  variant_groups: VariantGroup[];
  modifier_groups: ModifierGroup[];
};

export type ServiceCategory = { id: number; name: string; icon: string };

export type ServiceBody = Pick<Service, 'name' | 'unit' | 'price_before_tax' | 'category_id' | 'tax_type' | 'internal_notes' | 'discount_type' | 'discount_value'> & { variant_group_ids?: number[]; modifier_group_ids?: number[] };

/** What the services list asks the server for: a search, a category, a unit, whether it is on sale, an order and a page. */
export type ServicesParams = { q?: string; category_id?: number; unit?: ServiceUnit | ''; active?: 'true' | 'false' | ''; sort_by?: string; sort_dir?: 'asc' | 'desc'; limit: number; offset: number };
