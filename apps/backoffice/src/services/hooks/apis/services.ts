import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createService, deleteService, type Service, type ServiceBody, type ServicesParams, updateService } from '@/core/api';
import { queries } from '@/services/queries';

export const useServices = () => useQuery(queries.services.list);

/** One page of the services list (searched, filtered, sorted by the server); the page before stays while the next loads. */
export const useServiceList = (params: ServicesParams) => useQuery({ ...queries.services.page(params), placeholderData: keepPreviousData });

export const useServiceCategories = () => useQuery(queries.services.categories);

/** The tax types and their rates, for the form's price preview. */
export const useTaxRates = () => useQuery(queries.services.taxRates);

/** Creates a service, or updates it when it has an `id`; the services are fetched again afterwards. */
export const useSaveService = (options?: { onSaved?: (saved: Service) => void }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: ServiceBody & { id?: number; active: boolean }) => (id ? updateService(id, body) : createService(body)),
    onSuccess: (saved) => {
      options?.onSaved?.(saved);
      return queryClient.invalidateQueries({ queryKey: queries.services._def });
    },
  });
};

/**
 * Deletes a service. Its group links and recipe go with it, so the services, the groups (their "used by" counts), the costing and
 * the recipes are all fetched again afterwards. `onDeleted` runs first (a detail page leaves for the list).
 */
export const useDeleteService = (options?: { onDeleted?: () => void }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (s: Pick<Service, 'id'>) => deleteService(s.id),
    onSuccess: () => {
      options?.onDeleted?.();
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: queries.services._def }),
        queryClient.invalidateQueries({ queryKey: queries.groups._def }),
        queryClient.invalidateQueries({ queryKey: queries.costing._def }),
      ]);
    },
  });
};
