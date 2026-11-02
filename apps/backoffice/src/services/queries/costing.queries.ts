import { createQueryKeys } from '@lukemorales/query-key-factory';
import { getBom, getServiceCosting } from '@/core/api';
import type { BomOwner } from '@/core/api';

export const costingQueries = createQueryKeys('costing', {
  bom: (owner: BomOwner, id: number) => ({
    queryKey: [owner, id],
    queryFn: ({ signal }) => getBom(owner, id, signal),
  }),
  service: (serviceId: number) => ({
    queryKey: [serviceId],
    queryFn: ({ signal }) => getServiceCosting(serviceId, signal),
  }),
});
