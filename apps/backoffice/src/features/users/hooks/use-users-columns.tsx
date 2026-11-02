import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { Ban, UserCheck } from 'lucide-react';
import { actionsColumn, Badge, RowActions } from '@wuzz/web-ui';
import type { User } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { accountTone } from '@/features/accounts/utils/status';


/** The columns of the customers table; the last one blocks or unblocks a customer. */
export function useUsersColumns({ busy, onChange }: { busy: boolean; onChange: (user: User, to: User['status']) => void }) {
  const { t } = useTranslation();

  return useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('users.columns.user'),
        cell: ({ row: { original: u } }) => (
          <>
            <div className="font-medium">{u.name}</div>
            <div className="text-xs text-muted-foreground">@{u.username}</div>
          </>
        ),
      },
      { id: 'phone', enableSorting: false, header: t('users.columns.phone'), cell: ({ row }) => row.original.phone },
      { id: 'roles', enableSorting: false, header: t('users.columns.roles'), cell: ({ row: { original: u } }) => (u.roles.length ? u.roles.join(', ') : <span className="text-muted-foreground">{t('users.customer')}</span>) },
      { accessorKey: 'points', header: t('users.columns.points'), cell: ({ row }) => row.original.points },
      { id: 'streak', enableSorting: false, header: t('users.columns.streak'), cell: ({ row }) => row.original.streak },
      { id: 'status', enableSorting: false, header: t('users.columns.status'), cell: ({ row: { original: u } }) => <Badge tone={accountTone(u.status)}>{t(`status.user.${u.status}`)}</Badge> },
      { accessorKey: 'created_at', header: t('users.columns.joined'), meta: { className: 'whitespace-nowrap text-xs' }, cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString('id-ID') },
      actionsColumn<User>({
        header: t('common.actions'),
        cell: (u) => (
          <RowActions
            extra={[
              u.status === 'banned'
                ? { label: `${t('users.unban')}: ${u.name}`, icon: <UserCheck className="size-4" aria-hidden />, disabled: busy, onClick: () => onChange(u, 'active') }
                : { label: `${t('users.ban')}: ${u.name}`, icon: <Ban className="size-4" aria-hidden />, danger: true, disabled: busy, onClick: () => onChange(u, 'banned') },
            ]}
          />
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, busy, onChange],
  );
}
