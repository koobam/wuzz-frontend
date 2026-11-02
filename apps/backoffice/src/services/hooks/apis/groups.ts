import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createModifierGroup,
  createVariantGroup,
  deleteModifierGroup,
  deleteVariantGroup,
  type GroupQuery,
  type ModifierGroup,
  type ModifierGroupBody,
  type ModifierGroupQuery,
  updateModifierGroup,
  updateVariantGroup,
  type VariantGroup,
  type VariantGroupBody,
} from '@/core/api';
import { queries } from '@/services/queries';

export const useVariantGroups = (params: GroupQuery) => useQuery({ ...queries.groups.variants(params), placeholderData: keepPreviousData });
export const useModifierGroups = (params: ModifierGroupQuery) => useQuery({ ...queries.groups.modifiers(params), placeholderData: keepPreviousData });

/** One group, for its page; `id` is not a valid group (0, NaN) → no request is made. */
export const useVariantGroup = (id: number) => useQuery({ ...queries.groups.variant(id), enabled: Number.isInteger(id) && id > 0 });
export const useModifierGroup = (id: number) => useQuery({ ...queries.groups.modifier(id), enabled: Number.isInteger(id) && id > 0 });

/** Every variant / modifier group, for the pickers of the service form. */
export const useAllVariantGroups = () => useQuery(queries.groups.allVariants);
export const useAllModifierGroups = () => useQuery(queries.groups.allModifiers);

// A group is shown on the services that use it, so a change refreshes the groups and the services.
const useRefreshGroups = () => {
  const queryClient = useQueryClient();
  return () => Promise.all([queryClient.invalidateQueries({ queryKey: queries.groups._def }), queryClient.invalidateQueries({ queryKey: queries.services._def })]);
};

export const useSaveVariantGroup = (options?: { onSaved?: (saved: VariantGroup) => void }) => {
  const refresh = useRefreshGroups();
  return useMutation({
    mutationFn: ({ id, ...body }: VariantGroupBody & { id?: number }) => (id ? updateVariantGroup(id, body) : createVariantGroup(body)),
    onSuccess: (saved) => {
      options?.onSaved?.(saved);
      return refresh();
    },
  });
};
export const useDeleteVariantGroup = () => {
  const refresh = useRefreshGroups();
  return useMutation({ mutationFn: (g: VariantGroup) => deleteVariantGroup(g.id), onSuccess: refresh });
};

export const useSaveModifierGroup = (options?: { onSaved?: (saved: ModifierGroup) => void }) => {
  const refresh = useRefreshGroups();
  return useMutation({
    mutationFn: ({ id, ...body }: ModifierGroupBody & { id?: number }) => (id ? updateModifierGroup(id, body) : createModifierGroup(body)),
    onSuccess: (saved) => {
      options?.onSaved?.(saved);
      return refresh();
    },
  });
};
export const useDeleteModifierGroup = () => {
  const refresh = useRefreshGroups();
  return useMutation({ mutationFn: (g: ModifierGroup) => deleteModifierGroup(g.id), onSuccess: refresh });
};
