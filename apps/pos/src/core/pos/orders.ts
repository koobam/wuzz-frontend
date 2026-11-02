import { listServerOrders, patchOrderStatus, sendOrder, type ServerOrder, type ServerOrderBody } from '@/core/api';
import type { Order, OrderLine, OrderStatus } from './types';

const fromServer = (o: ServerOrder): Order => ({
  id: o.id,
  code: o.code,
  outletId: o.outlet_id,
  customerName: o.customer_name,
  customerPhone: o.customer_phone,
  lines: o.lines.map((l) => ({
    itemId: l.item_id,
    name: l.name,
    unit: l.unit,
    price: l.price,
    qty: l.qty,
    variant: l.variant,
    modifiers: l.modifiers?.map((m) => ({ group: m.group ?? '', name: m.name, price: m.price })),
    variantOptionIds: l.variant_option_ids,
    modifierOptionIds: l.modifier_option_ids,
  })),
  total: o.total,
  createdAt: o.created_at,
  status: o.status,
});

const toBody = (id: string, input: NewOrder): ServerOrderBody => ({
  id,
  outlet_id: input.outletId,
  customer_name: input.customerName,
  customer_phone: input.customerPhone,
  lines: input.lines.map((l) => ({ item_id: l.itemId, name: l.name, unit: l.unit, price: l.price, qty: l.qty, variant: l.variant, modifiers: l.modifiers, variant_option_ids: l.variantOptionIds, modifier_option_ids: l.modifierOptionIds })),
});

export type NewOrder = { outletId: number; customerName: string; customerPhone: string; lines: OrderLine[] };

/** The till's orders, newest first, as the server has them. The POS is online-only: nothing is kept on the device. */
export async function fetchOrders(): Promise<Order[]> {
  const { items } = await listServerOrders(100);
  return items.map(fromServer).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Rings up an order. It goes to the server now, and fails now if it cannot. `id` is the idempotency key: if a reply was lost and the
 * same order is sent again with the same id, the server returns the order it already made instead of making a second.
 */
export async function placeOrder(id: string, input: NewOrder): Promise<Order> {
  return fromServer(await sendOrder(toBody(id, input)));
}

/** Moves an order along its lifecycle. The server enforces the rules, and takes the stock out or puts it back as it does. */
export async function setStatus(id: string, status: OrderStatus): Promise<Order> {
  return fromServer(await patchOrderStatus(id, status));
}
