import { useServerTable } from '@wuzz/web-ui';
import { useDeleteService, useSaveService, useServiceCategories, useServiceList } from '@/services/hooks/apis';
import { useConfirmAction } from '@/services/hooks/use-confirm-action';
import { useTableLabels } from '@/services/hooks/use-table-labels';
import { serviceBody, serviceValues } from '../utils/service-form.schema';
import { servicesFiltersSchema } from '../utils/services-filters.schema';
import { useServicesColumns } from './use-services-columns';

/**
 * The services page: the list, searched, filtered by category, unit and status, sorted and paged by the server. Making
 * and editing a service are pages of their own. The page only draws what this returns.
 */
export function useServicesPage() {
  const table = useServerTable({ schema: servicesFiltersSchema });
  const services = useServiceList({
    ...table.params,
    category_id: table.filters.category || undefined,
    unit: table.filters.unit,
    active: table.filters.active,
  });
  const categories = useServiceCategories();
  const labels = useTableLabels({ search: 'services.search', showing: 'services.showing' });
  const save = useSaveService();
  const remove = useDeleteService();
  const ask = useConfirmAction();
  const columns = useServicesColumns(categories.data, {
    busy: save.isPending || remove.isPending,
    onDelete: async (s) => {
      if (await ask.remove('service', s.name)) remove.mutate(s);
    },
    // Turning a service on or off sends it back as it is (groups included), with only `active` flipped.
    onToggle: async (s) => {
      if (!(await ask.toggle('service', s.name, !s.active))) return;
      save.mutate({ id: s.id, ...serviceBody({ ...serviceValues(s), active: !s.active }) });
    },
  });

  return {
    table,
    labels,
    columns,
    rows: services.data?.items ?? [],
    total: services.data?.total ?? 0,
    ready: !!services.data,
    error: services.error ?? save.error ?? remove.error,
    filters: {
      categories: categories.data ?? [],
      category: table.filters.category,
      unit: table.filters.unit,
      active: table.filters.active,
      onCategory: (v: number) => table.setFilter('category', v),
      onUnit: (v: '' | 'kg' | 'pcs' | 'sesi' | 'unit') => table.setFilter('unit', v),
      onActive: (v: '' | 'true' | 'false') => table.setFilter('active', v),
    },
  };
}
