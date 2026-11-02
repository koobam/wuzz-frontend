import { useNavigate, useParams } from '@tanstack/react-router';
import type { ModifierGroup } from '@/core/api';
import { toId } from '@/core/utils/params';
import { useModifierGroup } from '@/services/hooks/apis';

/**
 * The page that makes or edits a modifier group: with an id in the address it edits that group, without one it makes a
 * new one. After saving it goes to the group's page; cancelling goes back to where it came from.
 */
export function useModifierFormPage() {
  const { id: raw } = useParams({ strict: false }) as { id?: string };
  const editing = raw !== undefined;
  const id = toId(raw);
  const navigate = useNavigate();
  const group = useModifierGroup(id);

  return {
    editing,
    group: group.data,
    loading: editing && !!id && group.isPending,
    isMissing: editing && (!id || (group.isError && !group.data)),
    error: group.error,
    onSaved: (saved: ModifierGroup) => void navigate({ to: '/modifiers/$id', params: { id: String(saved.id) } }),
    onCancel: () => void (id ? navigate({ to: '/modifiers/$id', params: { id: String(id) } }) : navigate({ to: '/modifiers' })),
  };
}
