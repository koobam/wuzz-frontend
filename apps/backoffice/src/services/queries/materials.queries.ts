import { createQueryKeys } from '@lukemorales/query-key-factory';
import { getMaterial, listMaterials } from '@/core/api';
import type { MaterialQuery } from '@/core/api';

export const materialsQueries = createQueryKeys('materials', {
  list: (params: MaterialQuery) => ({
    queryKey: [params],
    queryFn: ({ signal }) => listMaterials(params, signal),
  }),
  detail: (id: number) => ({
    queryKey: [id],
    queryFn: ({ signal }) => getMaterial(id, signal),
  }),
  /** Every active material by name: what a recipe line picks from. */
  active: {
    queryKey: null,
    queryFn: ({ signal }) => listMaterials({ active: 'true', limit: 100, sort_by: 'name' }, signal).then((p) => p.items),
  },
});
