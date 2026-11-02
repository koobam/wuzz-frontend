import { api, post, qs } from '@/core/http';
import type { Page } from '@/core/http';
import type { Injection, InjectionBody, InjectionsParams } from './voucher-injections.types';

/** Sends a voucher into the wallets of some customers (by id and by phone number); answers with the record of the send. */
export const sendVoucher = (voucherId: number, b: InjectionBody) => post<Injection>(`/vouchers/${voucherId}/inject`, b);

/** One page of the history of sends, newest first. */
export const listInjections = (p: InjectionsParams, signal?: AbortSignal) => api<Page<Injection>>(`/voucher-injections${qs(p)}`, { signal });
