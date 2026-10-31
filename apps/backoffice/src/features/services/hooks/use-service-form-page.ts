import { useNavigate, useParams } from '@tanstack/react-router';
import type { Service } from '@/core/api';
import { toId } from '@/core/utils/params';
import { useServices } from '@/services/hooks/apis';

/**
 * The page that makes or edits a service: with an id in the address it edits that service, without one it makes a new
 * one. After saving it goes to the service's page; cancelling goes back to where it came from.
 */
export function useServiceFormPage() {
  const { id: raw } = useParams({ strict: false }) as { id?: string };
  const editing = raw !== undefined;
  const id = toId(raw);
  const navigate = useNavigate();
  const services = useServices();
  const service = id ? services.data?.find((s) => s.id === id) : undefined;

  return {
    editing,
    service,
    loading: editing && !!id && services.isPending,
    isMissing: editing && (!id || (services.isSuccess && !service)),
    error: services.error,
    onSaved: (saved: Service) => void navigate({ to: '/services/$id', params: { id: String(saved.id) } }),
    onCancel: () => void (id ? navigate({ to: '/services/$id', params: { id: String(id) } }) : navigate({ to: '/services' })),
  };
}
