import { useSearch } from '@tanstack/react-router';
import { useServerTable } from '@wuzz/web-ui';
import { useInjections } from '@/services/hooks/apis';
import { useTableLabels } from '@/services/hooks/use-table-labels';
import { injectionsFiltersSchema } from '../utils/injections-filters.schema';
import { useInjectionsColumns } from './use-injections-columns';
import { useVoucherSend } from './use-voucher-send';

/** The send page: the form that sends a voucher to some customers, and below it the history of sends, filtered by voucher and paged by the server. */
export function useVoucherInjectionsPage() {
  const { voucher: preselected } = useSearch({ from: '/_authed/voucher-injections' });
  const send = useVoucherSend(preselected ?? 0);
  const table = useServerTable({ schema: injectionsFiltersSchema, defaultSort: { id: 'id', desc: true } });
  const history = useInjections({ voucher_id: table.filters.voucher || undefined, limit: table.pageSize, offset: table.offset });
  const columns = useInjectionsColumns();
  const labels = useTableLabels({ search: 'vouchers.history.search', showing: 'vouchers.history.showing' });

  return {
    send,
    history: {
      table,
      labels,
      columns,
      rows: history.data?.items ?? [],
      total: history.data?.total ?? 0,
      ready: !!history.data,
      error: history.error,
      voucher: table.filters.voucher,
      onVoucher: (v: number) => table.setFilter('voucher', v),
    },
  };
}
