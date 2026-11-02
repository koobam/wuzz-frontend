import { createQueryKeys } from '@lukemorales/query-key-factory';
import { listOutlets, listOutletsIn, listOutletsPage } from '@/core/api';
import type { Area, OutletsParams } from '@/core/api';

export const outletsQueries = createQueryKeys('outlets', {
  all: {
    queryKey: null,
    queryFn: ({ signal }) => listOutlets(signal),
  },
  list: (params: OutletsParams) => ({
    queryKey: [params],
    queryFn: ({ signal }) => listOutletsPage(params, signal),
  }),
  inArea: (area: Area) => ({
    queryKey: [area],
    queryFn: ({ signal }) => listOutletsIn(area, signal),
  }),
});
