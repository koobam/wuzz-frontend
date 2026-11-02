import { createQueryKeys } from '@lukemorales/query-key-factory';
import { listServiceCategories, listServices, listServicesPage, listTaxRates } from '@/core/api';
import type { ServicesParams } from '@/core/api';

export const servicesQueries = createQueryKeys('services', {
  list: {
    queryKey: null,
    queryFn: ({ signal }) => listServices(signal),
  },
  page: (params: ServicesParams) => ({
    queryKey: [params],
    queryFn: ({ signal }) => listServicesPage(params, signal),
  }),
  taxRates: {
    queryKey: null,
    queryFn: ({ signal }) => listTaxRates(signal),
  },
  categories: {
    queryKey: null,
    queryFn: ({ signal }) => listServiceCategories(signal),
  },
});
