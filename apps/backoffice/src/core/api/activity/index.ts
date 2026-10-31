import { api, qs } from '@/core/http';
import type { Page } from '@/core/http';
import type { ActivityEntry, ActivityParams } from './activity.types';

/** The activity log (administrators only): who did what, newest first. */
export const listActivity = (p: ActivityParams, signal?: AbortSignal) => api<Page<ActivityEntry>>(`/activity${qs(p)}`, { signal });
