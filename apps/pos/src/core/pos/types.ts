export type Outlet = { id: number; name: string; address: string };

export type CatalogItem = {
  id: number;
  name: string;
  unit: string;
  /** Rupiah, integer. */
  price: number;
  /** The category it is listed under (0 = none), the name of its icon, and a line about it. */
  categoryId: number;
  icon: string;
  description: string;
  /** The groups this service uses: variants (pick exactly one option from each; its `delta` is added to `price`) and modifiers (add-ons with a min and max). Empty = a plain item. */
  variantGroups: VariantGroup[];
  modifierGroups: ModifierGroup[];
};

export type VariantOption = { id: number; name: string; delta: number; isDefault: boolean };
export type VariantGroup = { id: number; name: string; options: VariantOption[] };
export type ModifierOption = { id: number; name: string; price: number };
/** `min` 0 is optional, 1+ required; `max` null is no ceiling. */
export type ModifierGroup = { id: number; name: string; min: number; max: number | null; options: ModifierOption[] };

/** A group of services, with the name of the icon it is drawn with. */
export type Category = { id: number; name: string; icon: string };

export type Catalog = { outlets: Outlet[]; services: CatalogItem[]; categories: Category[] };

/** The label of a line: the service, its variant, and the modifiers picked ("Cuci Kiloan · Express + Lipat, Wangi"). */
export const lineLabel = (l: { name: string; variant?: string; modifiers?: { name: string }[] }) =>
  `${l.name}${l.variant ? ` · ${l.variant}` : ''}${l.modifiers?.length ? ` + ${l.modifiers.map((m) => m.name).join(', ')}` : ''}`;

/** A line of an order. `price` is per unit and already includes the variant and the modifiers. */
export type OrderLine = {
  itemId: number;
  name: string;
  unit: string;
  price: number;
  qty: number;
  variant?: string;
  modifiers?: { group: string; name: string; price: number }[];
  /** The ids of the options picked, so that what the line consumed can be worked out later. Not used for the price. */
  variantOptionIds?: number[];
  modifierOptionIds?: number[];
};

/** The server's lifecycle: created → processing → ready → fulfilled, or cancelled. */
export type OrderStatus = 'created' | 'processing' | 'ready' | 'fulfilled' | 'cancelled';

export type Order = {
  /** The key of the order. The till makes it when ringing up, and sending the same one again returns the order the server already made. */
  id: string;
  /** What people call the order: TRX-DDMMYYYY-XXXX. Made by the server. */
  code: string;
  outletId: number;
  customerName: string;
  customerPhone: string;
  lines: OrderLine[];
  total: number;
  createdAt: string;
  status: OrderStatus;
};
