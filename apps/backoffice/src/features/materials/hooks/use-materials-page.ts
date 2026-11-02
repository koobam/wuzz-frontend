import { useServerTable } from '@wuzz/web-ui';
import type { MaterialCategory } from '@/core/api';
import { useDeleteMaterial, useMaterials, useSaveMaterial } from '@/services/hooks/apis';
import { useConfirmAction } from '@/services/hooks/use-confirm-action';
import { useTableLabels } from '@/services/hooks/use-table-labels';
import { materialsFiltersSchema } from '../utils/materials-filters.schema';
import { useMaterialColumns } from './use-material-columns';

/**
 * The materials page: the list (searched, filtered, sorted and paged by the server), opening one (its page, its form)
 * and deleting. The page only draws what this returns.
 */
export function useMaterialsPage() {
  const table = useServerTable({ schema: materialsFiltersSchema });
  const list = useMaterials({ ...table.params, category: table.filters.category, active: table.filters.active });
  const labels = useTableLabels({ search: 'materials.search', showing: 'materials.showing' });
  const remove = useDeleteMaterial();
  const save = useSaveMaterial();
  const ask = useConfirmAction();
  const columns = useMaterialColumns({
    busy: remove.isPending || save.isPending,
    onDelete: async (m) => {
      if (await ask.remove('material', m.name)) remove.mutate(m);
    },
    // Turning a material on or off sends it back as it is, with only `active` flipped.
    onToggle: async (m) => {
      if (!(await ask.toggle('material', m.name, !m.active))) return;
      save.mutate({ id: m.id, sku: m.sku, name: m.name, category: m.category, unit: m.unit, purchase_price: m.purchase_price, purchase_qty: m.purchase_qty, notes: m.notes, active: !m.active });
    },
  });

  return {
    table,
    labels,
    columns,
    rows: list.data?.items ?? [],
    total: list.data?.total ?? 0,
    ready: !!list.data,
    error: list.error ?? remove.error ?? save.error,
    filters: {
      category: table.filters.category,
      active: table.filters.active,
      onCategory: (v: MaterialCategory | '') => table.setFilter('category', v),
      onActive: (v: '' | 'true' | 'false') => table.setFilter('active', v),
    },
  };
}
