import { api, patch, qs } from '@/core/http';
import type { Page } from '@/core/http';
import type { User, AccountQuery, Account } from './users.types';

export const listUsers = (p: AccountQuery, signal?: AbortSignal) => api<Page<User>>(`/users${qs(p)}`, { signal });
export const setUserStatus = (id: string, status: User['status']) => patch<User>(`/users/${id}/status`, { status });


export const listAdmins = (p: AccountQuery, signal?: AbortSignal) => api<Page<Account>>(`/admins${qs(p)}`, { signal });
export const listStaff = (p: AccountQuery, signal?: AbortSignal) => api<Page<Account>>(`/staff${qs(p)}`, { signal });
