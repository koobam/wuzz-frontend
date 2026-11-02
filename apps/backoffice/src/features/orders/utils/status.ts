import { Ban, CheckCheck, PackageCheck, Play, type LucideIcon } from 'lucide-react';
import type { OrderStatus } from '@/core/api';

/** Every status an order can have, in the order it goes through them. */
export const ORDER_STATUSES: OrderStatus[] = ['created', 'processing', 'ready', 'fulfilled', 'cancelled'];

/** Where an order can go from each status: the forward step first, cancelling last. */
export const NEXT: Partial<Record<OrderStatus, OrderStatus[]>> = {
  created: ['processing', 'cancelled'],
  processing: ['ready', 'cancelled'],
  ready: ['fulfilled'],
};

export const tone = (s: OrderStatus) => (s === 'fulfilled' ? 'good' : s === 'cancelled' ? 'bad' : s === 'created' ? 'warn' : 'muted');

/** The icon of each move, so a row's actions stay a few small buttons that say what they do on hover. */
export const ACTION_ICON: Record<OrderStatus, LucideIcon> = { created: Play, processing: Play, ready: PackageCheck, fulfilled: CheckCheck, cancelled: Ban };
