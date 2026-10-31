import { createQueryKeys } from '@lukemorales/query-key-factory';
import { listOnline } from '@/core/api';

export const presenceQueries = createQueryKeys('presence', {
  online: {
    queryKey: null,
    queryFn: ({ signal }) => listOnline(signal),
  },
});
