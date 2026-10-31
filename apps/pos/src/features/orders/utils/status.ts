import type { OrderStatus } from '@/core/pos/types';

export const statusTone = (s: OrderStatus) => (s === 'fulfilled' ? 'good' : s === 'cancelled' ? 'bad' : s === 'created' ? 'warn' : 'muted');

/** What a staff member can do next; the server enforces the same lifecycle. */
export const NEXT: Partial<Record<OrderStatus, { to: OrderStatus; label: string }[]>> = {
  created: [{ to: 'processing', label: 'start' }, { to: 'cancelled', label: 'cancel' }],
  processing: [{ to: 'ready', label: 'ready' }, { to: 'cancelled', label: 'cancel' }],
  ready: [{ to: 'fulfilled', label: 'pickedUp' }],
};
