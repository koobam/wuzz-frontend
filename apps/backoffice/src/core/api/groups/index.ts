import { api, del, post, put, qs } from '@/core/http';
import type { Page } from '@/core/http';
import type { VariantGroup, VariantGroupBody, ModifierGroup, GroupQuery, ModifierGroupQuery, ModifierGroupBody } from './groups.types';

export const listVariantGroups = (p: GroupQuery = {}, signal?: AbortSignal) => api<Page<VariantGroup>>(`/variant-groups${qs(p)}`, { signal });
export const getVariantGroup = (id: number, signal?: AbortSignal) => api<VariantGroup>(`/variant-groups/${id}`, { signal });
export const createVariantGroup = (b: VariantGroupBody) => post<VariantGroup>('/variant-groups', b);
export const updateVariantGroup = (id: number, b: VariantGroupBody) => put<VariantGroup>(`/variant-groups/${id}`, b);
export const deleteVariantGroup = (id: number) => del(`/variant-groups/${id}`);

export const listModifierGroups = (p: ModifierGroupQuery = {}, signal?: AbortSignal) => api<Page<ModifierGroup>>(`/modifier-groups${qs(p)}`, { signal });
export const getModifierGroup = (id: number, signal?: AbortSignal) => api<ModifierGroup>(`/modifier-groups/${id}`, { signal });
export const createModifierGroup = (b: ModifierGroupBody) => post<ModifierGroup>('/modifier-groups', b);
export const updateModifierGroup = (id: number, b: ModifierGroupBody) => put<ModifierGroup>(`/modifier-groups/${id}`, b);
export const deleteModifierGroup = (id: number) => del(`/modifier-groups/${id}`);
