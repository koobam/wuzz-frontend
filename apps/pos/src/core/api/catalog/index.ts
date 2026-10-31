import { api } from '@/core/http';
import type { ServerCatalog } from './catalog.types';

export const getCatalog = (signal?: AbortSignal) => api<ServerCatalog>('/catalog', { signal });
