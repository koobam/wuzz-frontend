import { useServerTable } from '@wuzz/web-ui';
import { useDeleteVoucher, useOutlets, useSetVoucherStatus, useVoucherList } from '@/services/hooks/apis';
import { useConfirmAction } from '@/services/hooks/use-confirm-action';
import { useTableLabels } from '@/services/hooks/use-table-labels';
import { vouchersFiltersSchema } from '../utils/vouchers-filters.schema';
import { useVouchersColumns } from './use-vouchers-columns';

/**
 * The vouchers page: the list, searched, filtered by whether it is published, where its window stands, the kind of discount and
 * the outlet, sorted and paged by the server. Making and editing a voucher are pages of their own. The page only draws what this returns.
 */
export function useVouchersPage() {
  const table = useServerTable({ schema: vouchersFiltersSchema });
  const vouchers = useVoucherList({
    ...table.params,
    status: table.filters.status,
    period: table.filters.period,
    discount_type: table.filters.discount,
    outlet_id: table.filters.outlet || undefined,
  });
  const outlets = useOutlets();
  const labels = useTableLabels({ search: 'vouchers.search', showing: 'vouchers.showing' });
  const status = useSetVoucherStatus();
  const remove = useDeleteVoucher();
  const ask = useConfirmAction();
  const columns = useVouchersColumns({
    busy: status.isPending || remove.isPending,
    onDelete: async (v) => {
      if (await ask.remove('voucher', v.title)) remove.mutate(v);
    },
    onToggle: async (v) => {
      const to = v.status !== 'active';
      if (!(await ask.toggle('voucher', v.title, to))) return;
      status.mutate({ id: v.id, status: to ? 'active' : 'inactive' });
    },
  });

  return {
    table,
    labels,
    columns,
    rows: vouchers.data?.items ?? [],
    total: vouchers.data?.total ?? 0,
    ready: !!vouchers.data,
    error: vouchers.error ?? status.error ?? remove.error,
    filters: {
      outlets: outlets.data ?? [],
      status: table.filters.status,
      period: table.filters.period,
      discount: table.filters.discount,
      outlet: table.filters.outlet,
      onStatus: (v: '' | 'active' | 'inactive') => table.setFilter('status', v),
      onPeriod: (v: '' | 'running' | 'upcoming' | 'ended' | 'unlimited') => table.setFilter('period', v),
      onDiscount: (v: '' | 'percentage' | 'amount') => table.setFilter('discount', v),
      onOutlet: (v: number) => table.setFilter('outlet', v),
    },
  };
}
