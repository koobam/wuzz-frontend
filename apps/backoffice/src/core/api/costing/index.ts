import { api, post, put } from '@/core/http';
import type { BomOwner, Bom, BomBody, ServiceCosting, CalcBody, CalcResult } from './costing.types';

// Recipes (BOM) and what they cost. Quantities and costs are decimal strings, like the materials'.

export const getBom = (owner: BomOwner, id: number, signal?: AbortSignal) => api<Bom>(`/boms/${owner}/${id}`, { signal });
export const putBom = (owner: BomOwner, id: number, b: BomBody) => put<Bom>(`/boms/${owner}/${id}`, b);

export const getServiceCosting = (id: number, signal?: AbortSignal) => api<ServiceCosting>(`/services/${id}/costing`, { signal });

export const calcCost = (b: CalcBody) => post<CalcResult>('/costing/calc', b);
