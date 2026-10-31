import type { OrderStats } from '@/core/api';
import { ORDER_STATUSES } from '@/features/orders/utils/status';

export const percent = (part: number, whole: number) => (whole === 0 ? 0 : Math.round((part / whole) * 100));

/** The numbers of the tiles, from the server's count of orders per status (undefined while it is still loading). */
export function summarize(stats?: OrderStats) {
  const by = stats?.by_status;
  const total = by ? ORDER_STATUSES.reduce((sum, s) => sum + (by[s] ?? 0), 0) : undefined;
  const fulfilled = by?.fulfilled ?? 0;
  const cancelled = by?.cancelled ?? 0;
  return {
    loaded: !!by,
    created: by?.created ?? 0,
    total,
    open: by ? (by.created ?? 0) + (by.processing ?? 0) + (by.ready ?? 0) : undefined,
    fulfilled,
    cancelled,
    rate: percent(fulfilled, total ?? 0),
    cancelledShare: percent(cancelled, total ?? 0),
  };
}
