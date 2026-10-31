import { api, del, post, put, qs } from '@/core/http';
import type { Page } from '@/core/http';
import type { MaterialCategory, MaterialUnit, Material, MaterialBody, MaterialQuery } from './materials.types';

// Materials
// Quantities and unit costs are exact decimals and travel as STRINGS, never numbers: the server computes with exact
// fractions and rounds once at the end, so nothing here may turn them into floats.

export const MATERIAL_CATEGORIES: MaterialCategory[] = ['chemical', 'packaging', 'consumable', 'other'];
export const MATERIAL_UNITS: MaterialUnit[] = ['ml', 'g', 'pcs', 'sheet'];


export const listMaterials = (p: MaterialQuery = {}, signal?: AbortSignal) => api<Page<Material>>(`/materials${qs(p)}`, { signal });
export const getMaterial = (id: number, signal?: AbortSignal) => api<Material>(`/materials/${id}`, { signal });
export const createMaterial = (b: MaterialBody) => post<Material>('/materials', b);
export const updateMaterial = (id: number, b: MaterialBody) => put<Material>(`/materials/${id}`, b);
export const deleteMaterial = (id: number) => del(`/materials/${id}`);
