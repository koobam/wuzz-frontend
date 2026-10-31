import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { Badge } from '@wuzz/web-ui';
import type { Account, Outlet } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { accountTone } from '../utils/status';


/** The columns of the admins and staff tables. */
export function useAccountsColumns(outlets: Outlet[] | undefined) {
  const { t } = useTranslation();
  const outletName = (id: number) => outlets?.find((o) => o.id === id)?.name ?? `#${id}`;

  return useMemo<ColumnDef<Account>[]>(
    () => [
      { accessorKey: 'name', header: t('accounts.columns.name'), cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
      { id: 'phone', enableSorting: false, header: t('accounts.columns.phone'), cell: ({ row }) => row.original.phone },
      { id: 'role', enableSorting: false, header: t('accounts.columns.role'), cell: ({ row }) => t(`accounts.roles.${row.original.role}`, { defaultValue: row.original.role }) },
      { id: 'outlet', enableSorting: false, header: t('accounts.columns.outlet'), cell: ({ row }) => (row.original.outlet_id ? outletName(row.original.outlet_id) : <span className="text-muted-foreground">–</span>) },
      { id: 'status', enableSorting: false, header: t('accounts.columns.status'), cell: ({ row }) => <Badge tone={accountTone(row.original.status)}>{t(`status.user.${row.original.status}`)}</Badge> },
      { accessorKey: 'created_at', header: t('accounts.columns.created'), meta: { className: 'whitespace-nowrap text-xs' }, cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString('id-ID') },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, outlets],
  );
}
