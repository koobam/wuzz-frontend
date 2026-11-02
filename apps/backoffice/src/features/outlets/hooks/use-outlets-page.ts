import { useNavigate } from '@tanstack/react-router';
import { useMemo } from 'react';
import { useServerTable } from '@wuzz/web-ui';
import { outletToBody } from '@/core/api';
import { useDeleteOutlet, useOutletList, useOutlets, useSaveOutlet } from '@/services/hooks/apis';
import { useConfirmAction } from '@/services/hooks/use-confirm-action';
import { useTableLabels } from '@/services/hooks/use-table-labels';
import { outletsFiltersSchema } from '../utils/outlets-filters.schema';
import { useOutletsColumns } from './use-outlets-columns';

/**
 * The outlets page: the list, searched, filtered by status, sorted and paged by the server. Making and editing an
 * outlet are pages of their own. The page only draws what this returns.
 */
export function useOutletsPage() {
  const table = useServerTable({ schema: outletsFiltersSchema });
  const outlets = useOutletList({ ...table.params, active: table.filters.active });
  const labels = useTableLabels({ search: 'outlets.search', showing: 'outlets.showing' });
  const save = useSaveOutlet();
  const remove = useDeleteOutlet();
  const ask = useConfirmAction();
  const columns = useOutletsColumns({
    busy: save.isPending || remove.isPending,
    onDelete: async (o) => {
      if (await ask.remove('outlet', o.name)) remove.mutate(o);
    },
    // Turning an outlet on or off sends it back as it is, with only `active` flipped.
    onToggle: async (o) => {
      if (!(await ask.toggle('outlet', o.name, !o.active))) return;
      save.mutate({ id: o.id, ...outletToBody(o), active: !o.active });
    },
  });
  // The map shows every outlet (the table below pages through them).
  const all = useOutlets();
  const markers = useMemo(() => (all.data ?? []).map((o) => ({ id: o.id, name: o.name, address: o.address, phone: o.phone, image: o.images[0] ?? '', latitude: o.latitude, longitude: o.longitude, active: o.active })), [all.data]);
  const navigate = useNavigate();

  return {
    markers,
    openOutlet: (id: number) => void navigate({ to: '/outlets/$id', params: { id: String(id) } }),
    table,
    labels,
    columns,
    rows: outlets.data?.items ?? [],
    total: outlets.data?.total ?? 0,
    ready: !!outlets.data,
    error: outlets.error ?? save.error ?? remove.error,
    filters: { active: table.filters.active, onActive: (v: '' | 'true' | 'false') => table.setFilter('active', v) },
  };
}
