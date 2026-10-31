import type { User } from '@/core/api';

/** The colour of an account's status badge: customers, admins and staff share it. */
export const accountTone = (s: User['status']) => (s === 'active' ? 'good' : s === 'banned' ? 'bad' : 'warn');
export const ACCOUNT_STATUSES: User['status'][] = ['active', 'inactive', 'banned'];
