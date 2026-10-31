import { useNavigate, useParams } from '@tanstack/react-router';
import type { Material } from '@/core/api';
import { toId } from '@/core/utils/params';
import { useMaterial } from '@/services/hooks/apis';

/**
 * The page that makes or edits a material: with an id in the address it edits that material, without one it makes a new
 * one. After saving it goes to the material's page; cancelling goes back to where it came from.
 */
export function useMaterialFormPage() {
  const { id: raw } = useParams({ strict: false }) as { id?: string };
  const editing = raw !== undefined;
  const id = toId(raw);
  const navigate = useNavigate();
  const material = useMaterial(id);

  return {
    editing,
    material: material.data,
    loading: editing && !!id && material.isPending,
    isMissing: editing && (!id || (material.isError && !material.data)),
    error: material.error,
    onSaved: (saved: Material) => void navigate({ to: '/materials/$id', params: { id: String(saved.id) } }),
    onCancel: () => void (id ? navigate({ to: '/materials/$id', params: { id: String(id) } }) : navigate({ to: '/materials' })),
  };
}
