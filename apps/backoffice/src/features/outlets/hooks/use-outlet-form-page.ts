import { useNavigate, useParams } from '@tanstack/react-router';
import type { Outlet } from '@/core/api';
import { toId } from '@/core/utils/params';
import { useOutlets } from '@/services/hooks/apis';

/**
 * The page that makes or edits an outlet: with an id in the address it edits that outlet, without one it makes a new
 * one. After saving it goes to the outlet's page; cancelling goes back to where it came from.
 */
export function useOutletFormPage() {
  const { id: raw } = useParams({ strict: false }) as { id?: string };
  const editing = raw !== undefined;
  const id = toId(raw);
  const navigate = useNavigate();
  const outlets = useOutlets();
  const outlet = id ? outlets.data?.find((o) => o.id === id) : undefined;

  return {
    editing,
    outlet,
    loading: editing && !!id && outlets.isPending,
    isMissing: editing && (!id || (outlets.isSuccess && !outlet)),
    error: outlets.error,
    onSaved: (saved: Outlet) => void navigate({ to: '/outlets/$id', params: { id: String(saved.id) } }),
    onCancel: () => void (id ? navigate({ to: '/outlets/$id', params: { id: String(id) } }) : navigate({ to: '/outlets' })),
  };
}
