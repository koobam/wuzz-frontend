import { useNavigate, useParams } from '@tanstack/react-router';
import { toId } from '@/core/utils/params';
import { useDeleteService, useServiceCategories, useServices } from '@/services/hooks/apis';
import { useConfirmAction } from '@/services/hooks/use-confirm-action';

/** The service page: the service named in the address (the list has them all), its category, and deleting it (after a confirmation, then back to the list). */
export function useServiceDetailPage() {
  const { id: raw } = useParams({ from: '/_authed/services_/$id' });
  const id = toId(raw);
  const services = useServices();
  const categories = useServiceCategories();
  const service = id ? services.data?.find((s) => s.id === id) : undefined;
  const navigate = useNavigate();
  const ask = useConfirmAction();
  const remove = useDeleteService({ onDeleted: () => void navigate({ to: '/services' }) });

  return {
    id,
    service,
    category: service ? categories.data?.find((c) => c.id === service.category_id) : undefined,
    loading: !!id && services.isPending,
    isMissing: !id || (services.isSuccess && !service && !remove.isPending && !remove.isSuccess),
    error: services.error ?? remove.error,
    deleting: remove.isPending,
    onDelete: async () => {
      if (service && (await ask.remove('service', service.name))) remove.mutate(service);
    },
  };
}
