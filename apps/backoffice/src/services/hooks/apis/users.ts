import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { setUserStatus } from '@/core/api';
import type { AccountQuery, User } from '@/core/api';
import { queries } from '@/services/queries';

export const useUsers = (params: AccountQuery) => useQuery({ ...queries.users.list(params), placeholderData: keepPreviousData });

/** The back-office admins or the outlet staff: the same table over a different endpoint. */
export const useAccounts = (kind: 'admins' | 'staff', params: AccountQuery, options?: { enabled?: boolean }) =>
  useQuery({ ...queries.users.accounts(kind, params), placeholderData: keepPreviousData, enabled: options?.enabled ?? true });

export const useSetUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, to }: { id: string; to: User['status'] }) => setUserStatus(id, to),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queries.users._def }),
  });
};
