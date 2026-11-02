import { QueryClient } from '@tanstack/react-query';

/** Waktu cache sebelum query dianggap "inactive" dan bisa di-GC. */
const GC_TIME_MS = 30 * 60 * 1000; // 30 menit

/** Waktu data dianggap fresh; setelah ini query bisa refetch (0 = selalu bisa refetch). */
const STALE_TIME_MS = 5 * 60 * 1000; // 5 menit

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /** Refetch saat app aktif lagi (disambung lewat QuerySyncWithAppState). */
      refetchOnWindowFocus: false,
      /** Refetch saat koneksi jaringan kembali (disambung lewat QuerySyncWithAppState). */
      refetchOnReconnect: false,
      /** Refetch saat komponen mount jika data sudah stale. */
      refetchOnMount: false,
      /** Data dianggap stale setelah ini (ms). 0 = langsung stale = sering refetch. Naikkan kalau mau kurangi request. */
      staleTime: STALE_TIME_MS,
      /** Cache hasil query di memory selama ini setelah tidak ada observer (ms). */
      gcTime: GC_TIME_MS,
      /** Jumlah retry saat fetch gagal (default 3, exponential backoff). */
      retry: 3,
    },
  },
});
