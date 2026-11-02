import { createQueryKeys } from '@lukemorales/query-key-factory';
import { listAdmins, listStaff, listUsers } from '@/core/api';
import type { AccountQuery } from '@/core/api';

export const usersQueries = createQueryKeys('users', {
  list: (params: AccountQuery) => ({
    queryKey: [params],
    queryFn: ({ signal }) => listUsers(params, signal),
  }),
  /** The back-office admins or the outlet staff: the same shape over a different endpoint. */
  accounts: (kind: 'admins' | 'staff', params: AccountQuery) => ({
    queryKey: [kind, params],
    queryFn: ({ signal }) => (kind === 'admins' ? listAdmins : listStaff)(params, signal),
  }),
});
