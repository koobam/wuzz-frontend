import type { OrderStatus } from '@/core/pos/types';

/** An order as the server sends it. */
export type ServerOrder = {
  id: string;
  code: string;
  outlet_id: number;
  customer_name: string;
  customer_phone: string;
  lines: { item_id: number; name: string; unit: string; price: number; qty: number; variant?: string; modifiers?: { group?: string; name: string; price: number }[]; variant_option_ids?: number[]; modifier_option_ids?: number[] }[];
  total: number;
  status: OrderStatus;
  created_at: string;
};

/** What the till sends to make an order; the `id` doubles as the idempotency key. The server makes the code. */
export type ServerOrderBody = {
  id: string;
  outlet_id: number;
  customer_name: string;
  customer_phone: string;
  lines: { item_id: number; name: string; unit: string; price: number; qty: number; variant?: string; modifiers?: { group: string; name: string; price: number }[]; variant_option_ids?: number[]; modifier_option_ids?: number[] }[];
};
