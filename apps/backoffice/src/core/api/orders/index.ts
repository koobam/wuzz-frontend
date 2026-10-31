import { api, patch, qs } from '@/core/http';
import type { Page } from '@/core/http';
import type { OrderStatus, Order, OrderFilter, OrdersParams, OrderSummary, OrderStats } from './orders.types';

/** The label of an order line: the service, its variant, and the modifiers picked ("Cuci Kiloan · Express + Lipat, Wangi"). */
export const lineLabel = (l: { name: string; variant?: string; modifiers?: { name: string }[] }) =>
  `${l.name}${l.variant ? ` · ${l.variant}` : ''}${l.modifiers?.length ? ` + ${l.modifiers.map((m) => m.name).join(', ')}` : ''}`;

export const listOrders = (p: OrdersParams, signal?: AbortSignal) => api<Page<Order>>(`/orders${qs(p)}`, { signal });
export const getOrderSummary = (p: OrderFilter, signal?: AbortSignal) => api<OrderSummary>(`/orders/summary${qs(p)}`, { signal });
export const getOrder = (id: string, signal?: AbortSignal) => api<Order>(`/orders/${id}`, { signal });
export const setOrderStatus = (id: string, status: OrderStatus) => patch<Order>(`/orders/${id}/status`, { status });

/** Everything in it is about the orders created from `from` to `to` (YYYY-MM-DD, both included). */
export const orderStats = (range: { from: string; to: string }, signal?: AbortSignal) => api<OrderStats>(`/stats/orders${qs(range)}`, { signal });
