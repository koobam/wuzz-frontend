import { api, del, patch, post, qs } from '@/core/http';
import type { Page } from '@/core/http';
import type { DiscountType, ServiceUnit, Service, TaxRate, TaxType, ServiceCategory, ServiceBody, ServicesParams } from './services.types';

export const SERVICE_UNITS: ServiceUnit[] = ['kg', 'pcs', 'sesi', 'unit'];
export const TAX_TYPES: TaxType[] = ['none', 'ppn'];
export const DISCOUNT_TYPES: DiscountType[] = ['none', 'value', 'percent'];

/** The tax types and their rates, for the form's preview; the official figures are always the server's. */
export const listTaxRates = (signal?: AbortSignal) => api<{ types: TaxRate[] }>('/tax', { signal }).then((r) => r.types);


export const listServiceCategories = (signal?: AbortSignal) => api<ServiceCategory[]>('/service-categories', { signal });

export const listServices = (signal?: AbortSignal) => api<Service[]>('/services', { signal });

/** One page of services, searched, filtered and sorted by the server (`limit` asks for the paged answer). */
export const listServicesPage = (p: ServicesParams, signal?: AbortSignal) => api<Page<Service>>(`/services${qs(p)}`, { signal });
export const createService = (s: ServiceBody) => post<Service>('/services', s);
export const updateService = (id: number, s: ServiceBody & { active: boolean }) => patch<Service>(`/services/${id}`, s);

/** Deletes the service with its group links and its own recipe; orders keep their own copy of what they sold. */
export const deleteService = (id: number) => del<{ id: number }>(`/services/${id}`);
