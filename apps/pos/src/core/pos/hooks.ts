import { useQuery } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';
import { loadCatalog } from './catalog';
import { fetchOrders } from './orders';

const subscribeOnline = (cb: () => void) => {
  window.addEventListener('online', cb);
  window.addEventListener('offline', cb);
  return () => {
    window.removeEventListener('online', cb);
    window.removeEventListener('offline', cb);
  };
};

/** Whether the browser has a connection. The POS needs one: what depends on the server is switched off without it. */
export function useOnline() {
  return useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true);
}

export function useCatalog() {
  return useQuery({ queryKey: ['pos', 'catalog'], queryFn: loadCatalog, staleTime: 5 * 60_000 });
}

/** The orders, straight from the server. Other tills and the back office change them, so they are read again every 15 seconds. */
export function useOrders() {
  return useQuery({ queryKey: ['pos', 'orders'], queryFn: fetchOrders, staleTime: 0, refetchInterval: 15_000 });
}
