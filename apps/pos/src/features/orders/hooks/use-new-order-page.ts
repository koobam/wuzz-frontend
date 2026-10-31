import { useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { ApiError } from '@/core/http';
import { useCatalog } from '@/core/pos/hooks';
import { placeOrder } from '@/core/pos/orders';
import type { CatalogItem } from '@/core/pos/types';
import { useConfirmAction } from '@/services/hooks/use-confirm-action';
import { type CartLine, keyOf } from '../utils/cart';
import { type Choice, round, stepOf, unitPrice } from '../utils/pricing';
import { useCustomerForm } from './use-customer-form';

/** The page of ringing up an order: the catalog, the cart being built, the customer, and sending it to the server. */
export function useNewOrderPage() {
  const queryClient = useQueryClient();
  const { data: catalog, isLoading, isError, refetch } = useCatalog();
  const outlets = catalog?.outlets ?? [];
  const services = catalog?.services ?? [];
  const categories = catalog?.categories ?? [];

  const [category, setCategory] = useState<number | 'all'>('all');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [choosing, setChoosing] = useState<CatalogItem | null>(null);
  const customer = useCustomerForm();
  const ask = useConfirmAction();
  const [saved, setSaved] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // `network` = the server could not be reached at all; otherwise `message` is what the server (or the check on it) said.
  const [saveError, setSaveError] = useState<{ network: boolean; message: string } | null>(null);
  // The key of the order being sent. Pressing save again after a timeout sends the SAME key, so if the first attempt did reach the
  // server it returns that order instead of making a second; any change to the order or the customer gets a new key.
  const attempt = useRef<{ id: string; fingerprint: string } | null>(null);

  // A till is one outlet's, and which one comes from the account that signed in: a cashier's catalog holds exactly their
  // outlet. Anything else (an admin, who has every outlet) is not a till's account, and there is nothing to pick.
  const outlet = outlets.length === 1 ? outlets[0] : undefined;
  const outletId = outlet?.id ?? null;

  const lines = cart.map((l) => ({
    key: l.key,
    itemId: l.item.id,
    name: l.item.name,
    unit: l.item.unit,
    price: unitPrice(l.item, l.variants, l.modifiers),
    qty: l.qty,
    icon: l.item.icon,
    // The variants read as one label ("Express / Besar"); the modifiers keep the group they came from.
    variant: l.variants.length ? l.variants.map((v) => v.option.name).join(' / ') : undefined,
    modifiers: l.modifiers.map(({ group, option }) => ({ group, name: option.name, price: option.price })),
    variantOptionIds: l.variants.map((v) => v.option.id),
    modifierOptionIds: l.modifiers.map((m) => m.option.id),
  }));
  const total = Math.round(lines.reduce((s, l) => s + l.price * l.qty, 0));

  const shown = category === 'all' ? services : services.filter((s) => s.categoryId === category);
  const countIn = (id: number) => services.filter((s) => s.categoryId === id).length;
  const qtyOf = (item: CatalogItem) => round(cart.filter((l) => l.item.id === item.id).reduce((n, l) => n + l.qty, 0));

  // Sets a line's quantity; a quantity of 0 takes the line off the order.
  const setLine = (key: string, value: number) => setCart((c) => c.flatMap((l) => (l.key !== key ? [l] : value > 0 ? [{ ...l, qty: round(value) }] : [])));
  // A plain service (no variants, no modifiers) is one line, driven from its card.
  const setPlain = (item: CatalogItem, value: number) => {
    const key = keyOf(item, [], []);
    setCart((c) => (c.some((l) => l.key === key) ? c.flatMap((l) => (l.key !== key ? [l] : value > 0 ? [{ ...l, qty: round(value) }] : [])) : value > 0 ? [...c, { key, item, variants: [], modifiers: [], qty: round(value) }] : c));
  };
  const addChoice = (item: CatalogItem, choice: Choice) => {
    const key = keyOf(item, choice.variants, choice.modifiers);
    setCart((c) =>
      c.some((l) => l.key === key)
        ? c.map((l) => (l.key === key ? { ...l, qty: round(l.qty + choice.qty) } : l))
        : [...c, { key, item, variants: choice.variants, modifiers: choice.modifiers, qty: choice.qty }],
    );
    setChoosing(null);
  };

  const save = async () => {
    if (outletId == null || saving) return;
    if (!(await ask.placeOrder(lines.length, total))) return;
    const { name, phone } = customer.values();
    const input = {
      outletId,
      customerName: name,
      customerPhone: phone,
      lines: lines.map(({ icon: _icon, key: _key, ...line }) => ({
        ...line,
        modifiers: line.modifiers.length ? line.modifiers : undefined,
        variantOptionIds: line.variantOptionIds.length ? line.variantOptionIds : undefined,
        modifierOptionIds: line.modifierOptionIds.length ? line.modifierOptionIds : undefined,
      })),
    };
    const fingerprint = JSON.stringify(input);
    if (attempt.current?.fingerprint !== fingerprint) attempt.current = { id: crypto.randomUUID(), fingerprint };

    setSaving(true);
    setSaveError(null);
    setSaved(null);
    try {
      const order = await placeOrder(attempt.current.id, input);
      attempt.current = null;
      setSaved(order.code);
      setCart([]);
      customer.clear();
      void queryClient.invalidateQueries({ queryKey: ['pos', 'orders'] });
    } catch (e) {
      // The order was NOT made. Nothing is kept on the device to send later; the cart stays so the cashier can press save again.
      setSaveError({ network: !(e instanceof ApiError), message: e instanceof Error ? e.message : String(e) });
    } finally {
      setSaving(false);
    }
  };

  return {
    /** Why the page cannot be used yet, or null when it can. */
    blocked: isLoading ? null : isError ? ('loadFailed' as const) : outlets.length > 1 ? ('needsOutlet' as const) : outlets.length === 0 ? ('noCatalog' as const) : null,
    reload: () => void refetch(),
    categories,
    category,
    setCategory,
    services,
    shown,
    countIn,
    qtyOf,
    stepOf,
    setPlain,
    choosing,
    setChoosing,
    addChoice,
    lines,
    total,
    setLine,
    customer,
    outlet,
    canSave: outletId != null && lines.length > 0 && customer.valid,
    save,
    saved,
    saving,
    saveError,
  };
}
