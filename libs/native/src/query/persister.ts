import type { PersistedClient, Persister } from '@tanstack/react-query-persist-client';
import { MMKV } from 'react-native-mmkv';

const CACHE_KEY = 'RQ_CACHE';
const storage = new MMKV({ id: 'react-query-cache' });

/** Keeps the query cache in MMKV so a restarted app opens with the last data it had. */
export const queryPersister: Persister = {
  persistClient: async (client: PersistedClient) => {
    storage.set(CACHE_KEY, JSON.stringify(client));
  },
  restoreClient: async () => {
    const data = storage.getString(CACHE_KEY);
    if (!data) return undefined;
    return JSON.parse(data) as PersistedClient;
  },
  removeClient: async () => {
    storage.delete(CACHE_KEY);
  },
};
