import { api, patch, post } from '@/core/http';
import type { OrderStatus } from '@/core/pos/types';
import type { ServerOrder, ServerOrderBody } from './orders.types';

export const sendOrder = (body: ServerOrderBody) => post<ServerOrder>('/orders', body);
export const listServerOrders = (limit = 100, signal?: AbortSignal) => api<{ items: ServerOrder[] }>(`/orders?limit=${limit}`, { signal });
export const patchOrderStatus = (id: string, status: OrderStatus) => patch<ServerOrder>(`/orders/${id}/status`, { status });
