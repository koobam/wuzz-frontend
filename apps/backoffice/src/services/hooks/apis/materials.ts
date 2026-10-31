import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createMaterial, deleteMaterial, type Material, type MaterialBody, type MaterialQuery, updateMaterial } from '@/core/api';
import { queries } from '@/services/queries';

export const useMaterials = (params: MaterialQuery) => useQuery({ ...queries.materials.list(params), placeholderData: keepPreviousData });

/** One material, for its page; an id that is no material (0, NaN) makes no request. */
export const useMaterial = (id: number) => useQuery({ ...queries.materials.detail(id), enabled: Number.isInteger(id) && id > 0 });

/** Every active material, for the recipe editor. */
export const useActiveMaterials = (options?: { enabled?: boolean }) => useQuery({ ...queries.materials.active, enabled: options?.enabled ?? true });

const useRefreshMaterials = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queries.materials._def });
};

export const useSaveMaterial = (options?: { onSaved?: (saved: Material) => void }) => {
  const refresh = useRefreshMaterials();
  return useMutation({
    mutationFn: ({ id, ...body }: MaterialBody & { id?: number }) => (id ? updateMaterial(id, body) : createMaterial(body)),
    onSuccess: (saved) => {
      options?.onSaved?.(saved);
      return refresh();
    },
  });
};

export const useDeleteMaterial = () => {
  const refresh = useRefreshMaterials();
  return useMutation({ mutationFn: (m: Material) => deleteMaterial(m.id), onSuccess: refresh });
};
