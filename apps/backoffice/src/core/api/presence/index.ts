import { api, post } from '@/core/http';
import type { OnlineUser } from './presence.types';

/** Who pinged in the last 45 seconds (admins only). */
export const listOnline = (signal?: AbortSignal) => api<{ items: OnlineUser[] }>('/presence', { signal }).then((r) => r.items);
/** Marks the caller as online; the apps call it every 20 seconds while open. */
export const pingPresence = () => post<{ window_seconds: number }>('/presence/ping', {});
