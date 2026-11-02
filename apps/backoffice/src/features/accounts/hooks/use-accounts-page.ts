import { useServerTable } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import { useAccounts, useOutlets } from '@/services/hooks/apis';
import { useTableLabels } from '@/services/hooks/use-table-labels';
import { useAccountsColumns } from './use-accounts-columns';
import { accountsFiltersSchema } from '../utils/accounts-filters.schema';

/** The admins or the staff: the same table and filters over a different endpoint. */
export function useAccountsPage(kind: 'admins' | 'staff') {
  const { t } = useTranslation();
  const table = useServerTable({ schema: accountsFiltersSchema });
  const { status, outlet } = table.filters;
  const accounts = useAccounts(kind, { ...table.params, query: table.q, status, outlet_id: outlet || undefined });
  const outlets = useOutlets();
  const labels = useTableLabels({ search: 'accounts.searchPlaceholder', showing: 'accounts.showing' });
  const columns = useAccountsColumns(outlets.data);

  return {
    t,
    kind,
    table,
    labels,
    columns,
    status,
    outlet,
    outlets: outlets.data ?? [],
    accounts: { rows: accounts.data?.items ?? [], total: accounts.data?.total ?? 0, ready: !!accounts.data },
    error: accounts.error ?? outlets.error,
    refresh: () => void accounts.refetch(),
  };
}
