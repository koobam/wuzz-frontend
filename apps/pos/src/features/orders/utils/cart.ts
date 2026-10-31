import type { CatalogItem, ModifierOption, VariantOption } from '@/core/pos/types';

/** One line of the order being rung up: a service with the variants and modifiers picked for it. Two choices of the same service are two lines. */
export type CartLine = {
  key: string;
  item: CatalogItem;
  variants: { group: string; option: VariantOption }[];
  modifiers: { group: string; option: ModifierOption }[];
  qty: number;
};

export const keyOf = (item: CatalogItem, variants: { option: VariantOption }[], modifiers: { option: ModifierOption }[]) =>
  [item.id, 'v', ...variants.map((v) => v.option.id).sort((a, b) => a - b), 'm', ...modifiers.map((m) => m.option.id).sort((a, b) => a - b)].join(':');

/** A service with variants or modifiers has to be configured in a sheet; a plain one is counted from its card. */
export const customizable = (item: CatalogItem) => item.variantGroups.length > 0 || item.modifierGroups.length > 0;
