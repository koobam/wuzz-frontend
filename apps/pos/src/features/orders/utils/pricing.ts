import type { CatalogItem, ModifierGroup, ModifierOption, VariantOption } from '@/core/pos/types';

type Picked<O> = { group: string; option: O };

/** What the cashier picked for one line: one option of each variant group, the modifiers (with the group each came from), and how many. */
export type Choice = { variants: Picked<VariantOption>[]; modifiers: Picked<ModifierOption>[]; qty: number };

/** The price of one unit with the choices applied: the service's price, plus each variant's delta, plus every modifier. */
export const unitPrice = (item: CatalogItem, variants: { option: VariantOption }[], modifiers: { option: ModifierOption }[]) =>
  item.price + variants.reduce((sum, v) => sum + v.option.delta, 0) + modifiers.reduce((sum, m) => sum + m.option.price, 0);

/** A group's rule is met when the number picked is at least `min` and, if there is a ceiling, at most `max`. */
export const ruleMet = (g: ModifierGroup, picked: number) => picked >= g.min && (g.max === null || picked <= g.max);

/** How much one tap adds: half a kilo for a service sold by weight, one of anything else. */
export const stepOf = (item: { unit: string }) => (item.unit === 'kg' ? 0.5 : 1);

/** Quantities are kept to two places, so repeated half-steps never drift. */
export const round = (n: number) => Math.round(n * 100) / 100;
