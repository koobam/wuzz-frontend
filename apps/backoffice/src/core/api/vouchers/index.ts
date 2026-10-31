import { api, del, patch, post, put, qs } from '@/core/http';
import type { Page } from '@/core/http';
import type { HoldersParams, Voucher, VoucherBody, VoucherHolder, VouchersParams, VoucherStatus } from './vouchers.types';

/** The colours a voucher's coupon stub can have (the palette the customer app draws its wallet with). */
export const VOUCHER_COLORS = ['#0009FF', '#FF9500', '#16A34A', '#DC2626', '#7C3AED', '#0891B2', '#DB2777', '#111827'] as const;

/** One page of vouchers, searched, filtered and sorted by the server. */
export const listVouchersPage = (p: VouchersParams, signal?: AbortSignal) => api<Page<Voucher>>(`/vouchers${qs(p)}`, { signal });

/** Every voucher that is switched on (what the send page picks from): most recent first. */
export const listActiveVouchers = (signal?: AbortSignal) => api<Page<Voucher>>(`/vouchers${qs({ status: 'active', sort_by: 'id', sort_dir: 'desc', limit: 100, offset: 0 })}`, { signal }).then((p) => p.items);

export const getVoucher = (id: number, signal?: AbortSignal) => api<Voucher>(`/vouchers/${id}`, { signal });
export const createVoucher = (v: VoucherBody) => post<Voucher>('/vouchers', v);
export const updateVoucher = (id: number, v: VoucherBody) => put<Voucher>(`/vouchers/${id}`, v);

/** Turns a voucher on or off, changing nothing else about it. */
export const setVoucherStatus = (id: number, status: VoucherStatus) => patch<Voucher>(`/vouchers/${id}`, { status });
export const deleteVoucher = (id: number) => del<{ id: number; title: string }>(`/vouchers/${id}`);

/** The customers who hold a voucher, one page. */
export const listVoucherHolders = (id: number, p: HoldersParams, signal?: AbortSignal) => api<Page<VoucherHolder>>(`/vouchers/${id}/grants${qs(p)}`, { signal });
