/** A service a group is used by. */
export type GroupUse = { id: number; name: string };

/** Pick exactly one option, e.g. "Ukuran": Base (+0), Large (+12.727). The option's `price_delta` is added to the service's price. */
export type VariantOption = { id: number; name: string; price_delta: number; is_default: boolean; active: boolean; sort_index: number };

export type VariantGroup = { id: number; name: string; internal_notes: string; sort_index: number; options: VariantOption[]; services: GroupUse[]; created_at: string; updated_at: string };

export type VariantGroupBody = { name: string; internal_notes: string; options: { id?: number; name: string; price_delta: number; is_default: boolean; active: boolean }[] };

/** Add-ons with a rule: `min` 0 is optional, `min` 1+ required, `max` null no ceiling. */
export type ModifierOption = { id: number; name: string; price: number; active: boolean; sort_index: number };

export type ModifierGroup = { id: number; name: string; internal_notes: string; min: number; max: number | null; options: ModifierOption[]; services: GroupUse[]; created_at: string; updated_at: string };

/** What the group lists ask the server for: a search, an order, and (modifiers) whether the group is required. */
export type GroupQuery = { service_id?: number; usage?: '' | 'used' | 'unused'; q?: string; sort_by?: string; sort_dir?: 'asc' | 'desc'; limit?: number; offset?: number };

/** A modifier list can also be asked for the groups that are required (min 1+) or optional. */
export type ModifierGroupQuery = GroupQuery & { requirement?: 'required' | 'optional' | '' };

export type ModifierGroupBody = { name: string; internal_notes: string; min: number; max: number | null; options: { id?: number; name: string; price: number; active: boolean }[] };
