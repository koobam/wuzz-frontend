import { createQueryKeys } from '@lukemorales/query-key-factory';
import { listActivity } from '@/core/api';
import type { ActivityParams } from '@/core/api';

export const activityQueries = createQueryKeys('activity', {
  list: (params: ActivityParams) => ({
    queryKey: [params],
    queryFn: ({ signal }) => listActivity(params, signal),
  }),
});
