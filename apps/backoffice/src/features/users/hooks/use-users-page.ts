import { useCallback } from 'react';
import { useServerTable } from '@wuzz/web-ui';
import type { User } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { useSetUserStatus, useUsers } from '@/services/hooks/apis';
import { useConfirmAction } from '@/services/hooks/use-confirm-action';
import { useTableLabels } from '@/services/hooks/use-table-labels';
import { useUsersColumns } from './use-users-columns';
import { usersFiltersSchema } from '../utils/users-filters.schema';

/** The customers: who signed up in the app, with their points and streaks; a customer can be blocked from signing in. */
export function useUsersPage() {
  const { t } = useTranslation();
  const table = useServerTable({ schema: usersFiltersSchema });
  const { status } = table.filters;
  const labels = useTableLabels({ search: 'users.searchPlaceholder', showing: 'users.showing' });
  const users = useUsers({ ...table.params, query: table.q, status });
  const change = useSetUserStatus();
  const { mutate } = change;
  const ask = useConfirmAction();
  const onChange = useCallback(
    async (user: User, to: User['status']) => {
      if (to !== 'banned' && to !== 'active') return;
      if (await ask.userStatus(user.name, to)) mutate({ id: user.id, to });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mutate],
  );
  const columns = useUsersColumns({ busy: change.isPending, onChange });

  return {
    t,
    table,
    labels,
    columns,
    status,
    users: { rows: users.data?.items ?? [], total: users.data?.total ?? 0, ready: !!users.data },
    error: users.error ?? change.error,
    refresh: () => void users.refetch(),
  };
}
