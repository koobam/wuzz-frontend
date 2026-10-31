import { useServerTable } from '@wuzz/web-ui';
import { useBannerList, useDeleteBanner, useOutlets, useServices, useSetBannerStatus } from '@/services/hooks/apis';
import { useConfirmAction } from '@/services/hooks/use-confirm-action';
import { useTableLabels } from '@/services/hooks/use-table-labels';
import { bannersFiltersSchema } from '../utils/banners-filters.schema';
import { useBannersColumns, useTargetName } from './use-banners-columns';

/**
 * The banners page: the list, searched, filtered by whether it is published, whether it shows now and the outlet it shows at,
 * sorted and paged by the server. Making, editing and arranging banners are pages of their own. The page only draws what this returns.
 */
export function useBannersPage() {
  const table = useServerTable({ schema: bannersFiltersSchema });
  const banners = useBannerList({
    ...table.params,
    status: table.filters.status,
    live: table.filters.live,
    outlet_id: table.filters.outlet || undefined,
  });
  const outlets = useOutlets();
  const services = useServices();
  const labels = useTableLabels({ search: 'banners.search', showing: 'banners.showing' });
  const status = useSetBannerStatus();
  const remove = useDeleteBanner();
  const ask = useConfirmAction();
  const targetName = useTargetName(services.data, outlets.data);
  const columns = useBannersColumns(targetName, {
    busy: status.isPending || remove.isPending,
    onDelete: async (b) => {
      if (await ask.remove('banner', b.title)) remove.mutate(b);
    },
    onToggle: async (b) => {
      const to = b.status !== 'active';
      if (!(await ask.toggle('banner', b.title, to))) return;
      status.mutate({ id: b.id, status: to ? 'active' : 'inactive' });
    },
  });

  return {
    table,
    labels,
    columns,
    rows: banners.data?.items ?? [],
    total: banners.data?.total ?? 0,
    ready: !!banners.data,
    error: banners.error ?? status.error ?? remove.error,
    filters: {
      outlets: outlets.data ?? [],
      status: table.filters.status,
      live: table.filters.live,
      outlet: table.filters.outlet,
      onStatus: (v: '' | 'active' | 'inactive') => table.setFilter('status', v),
      onLive: (v: '' | 'true' | 'false') => table.setFilter('live', v),
      onOutlet: (v: number) => table.setFilter('outlet', v),
    },
  };
}
