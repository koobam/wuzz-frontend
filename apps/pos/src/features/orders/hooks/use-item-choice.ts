import { useState } from 'react';
import type { CatalogItem, ModifierGroup, VariantGroup } from '@/core/pos/types';
import { type Choice, round, ruleMet, stepOf, unitPrice } from '../utils/pricing';

const startOf = (g: VariantGroup) => (g.options.find((o) => o.isDefault) ?? g.options[0])!.id;

/** What is picked in the sheet of one service: an option of each variant group, the modifiers, and the quantity. */
export function useItemChoice(item: CatalogItem) {
  const step = stepOf(item);
  // One option per variant group, always: it starts on the group's default. Modifiers start empty.
  const [variantPick, setVariantPick] = useState<Record<number, number>>(() => Object.fromEntries(item.variantGroups.map((g) => [g.id, startOf(g)])));
  const [modPick, setModPick] = useState<Record<number, number[]>>({});
  const [qty, setQty] = useState(step);

  const variants = item.variantGroups.map((g) => ({ group: g.name, option: g.options.find((o) => o.id === variantPick[g.id])! }));
  const modifiers = item.modifierGroups.flatMap((g) => g.options.filter((o) => (modPick[g.id] ?? []).includes(o.id)).map((option) => ({ group: g.name, option })));
  const countIn = (g: ModifierGroup) => (modPick[g.id] ?? []).length;

  const toggle = (g: ModifierGroup, id: number) =>
    setModPick((prev) => {
      const ids = prev[g.id] ?? [];
      const on = ids.includes(id);
      // Pick-one: choosing another replaces; choosing the same again clears it, unless the group is required.
      if (g.max === 1) return { ...prev, [g.id]: on ? (g.min === 0 ? [] : ids) : [id] };
      if (on) return { ...prev, [g.id]: ids.filter((x) => x !== id) };
      if (g.max !== null && ids.length >= g.max) return prev;
      return { ...prev, [g.id]: [...ids, id] };
    });

  return {
    step,
    variantPick,
    pickVariant: (groupId: number, optionId: number) => setVariantPick((p) => ({ ...p, [groupId]: optionId })),
    isPicked: (g: ModifierGroup, id: number) => (modPick[g.id] ?? []).includes(id),
    countIn,
    toggle,
    qty,
    less: () => setQty((q) => Math.max(step, round(q - step))),
    more: () => setQty((q) => round(q + step)),
    setQty: (n: number) => setQty(Math.max(step, n || step)),
    valid: item.modifierGroups.every((g) => ruleMet(g, countIn(g))),
    price: unitPrice(item, variants, modifiers),
    choice: (): Choice => ({ variants, modifiers, qty }),
  };
}
