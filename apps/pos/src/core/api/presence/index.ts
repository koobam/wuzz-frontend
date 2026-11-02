import { post } from '@/core/http';

/** Tells the back office this till is open (it shows who is working right now); the app calls it every 20 seconds while visible. */
export const pingPresence = () => post<{ window_seconds: number }>('/presence/ping');
