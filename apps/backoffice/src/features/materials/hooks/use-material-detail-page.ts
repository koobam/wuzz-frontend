import { useParams } from '@tanstack/react-router';
import { toId } from '@/core/utils/params';
import { useMaterial } from '@/services/hooks/apis';

/** The material page: the material named in the address. */
export function useMaterialDetailPage() {
  const { id: raw } = useParams({ from: '/_authed/materials_/$id' });
  const id = toId(raw);
  const material = useMaterial(id);

  return {
    id,
    material: material.data,
    loading: !!id && material.isPending,
    isMissing: !id || (material.isError && !material.data),
    error: material.error,
  };
}
