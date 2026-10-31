import { createQueryKeys } from '@lukemorales/query-key-factory';
import { getModifierGroup, getVariantGroup, listModifierGroups, listVariantGroups } from '@/core/api';
import type { GroupQuery, ModifierGroupQuery } from '@/core/api';

/** The most groups a picker (the service form) asks for at once. */
const PICKER_LIMIT = 100;

export const groupsQueries = createQueryKeys('groups', {
  variants: (params: GroupQuery) => ({
    queryKey: [params],
    queryFn: ({ signal }) => listVariantGroups(params, signal),
  }),
  variant: (id: number) => ({
    queryKey: [id],
    queryFn: ({ signal }) => getVariantGroup(id, signal),
  }),
  allVariants: {
    queryKey: null,
    queryFn: ({ signal }) => listVariantGroups({ limit: PICKER_LIMIT }, signal).then((p) => p.items),
  },
  modifiers: (params: ModifierGroupQuery) => ({
    queryKey: [params],
    queryFn: ({ signal }) => listModifierGroups(params, signal),
  }),
  modifier: (id: number) => ({
    queryKey: [id],
    queryFn: ({ signal }) => getModifierGroup(id, signal),
  }),
  allModifiers: {
    queryKey: null,
    queryFn: ({ signal }) => listModifierGroups({ limit: PICKER_LIMIT }, signal).then((p) => p.items),
  },
});
