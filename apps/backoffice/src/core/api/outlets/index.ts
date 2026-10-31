import { api, del, patch, post, qs } from '@/core/http';
import type { Page } from '@/core/http';
import type { DeliveryType, Outlet, OutletCategory, OutletTimezone, OutletTimezoneLabel, Area, OutletsParams } from './outlets.types';

export const OUTLET_CATEGORIES: OutletCategory[] = ['laundry', 'caffe', 'all'];
export const DELIVERY_TYPES: DeliveryType[] = ['pickup', 'delivery'];

/** The zones an outlet can use, with their short name and offset (none of them has daylight saving). */
export const OUTLET_TIMEZONES: { value: OutletTimezone; label: OutletTimezoneLabel; offset: string }[] = [
  { value: 'Asia/Jakarta', label: 'WIB', offset: 'UTC+7' },
  { value: 'Asia/Makassar', label: 'WITA', offset: 'UTC+8' },
  { value: 'Asia/Jayapura', label: 'WIT', offset: 'UTC+9' },
];

/** What an outlet is created or updated with: everything the server stores that staff set (the id, whether it is open now and the status are not). */
export type OutletBody = Omit<Outlet, 'id' | 'active' | 'is_open_now' | 'timezone_label' | 'open_time' | 'close_time'> & { active?: boolean };

/** An outlet as the server takes it back: the same record without what the server works out (today's range, whether it is open, the zone's short name). */
export const outletToBody = (o: Outlet): OutletBody => {
  const { id: _id, is_open_now: _open, timezone_label: _label, open_time: _from, close_time: _to, ...body } = o;
  return body;
};

export const listOutlets = (signal?: AbortSignal) => api<Outlet[]>('/outlets', { signal });

/** One page of outlets, searched, filtered and sorted by the server (`limit` asks for the paged answer). */
export const listOutletsPage = (p: OutletsParams, signal?: AbortSignal) => api<Page<Outlet>>(`/outlets${qs(p)}`, { signal });

/** Only the outlets inside `area` (what the dashboard map is showing). */
export const listOutletsIn = (area: Area, signal?: AbortSignal) => api<Outlet[]>(`/outlets${qs(area)}`, { signal });
export const createOutlet = (o: OutletBody) => post<Outlet>('/outlets', o);
export const updateOutlet = (id: number, o: OutletBody) => patch<Outlet>(`/outlets/${id}`, o);

/** Deletes an outlet nothing points at; the server answers 409 (with what is left) when staff, admins, orders or stock records do. */
export const deleteOutlet = (id: number) => del<{ id: number }>(`/outlets/${id}`);
