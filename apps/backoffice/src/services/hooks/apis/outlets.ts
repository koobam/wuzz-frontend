import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createOutlet, deleteOutlet, type OutletBody, updateOutlet } from '@/core/api';
import type { Area, Outlet, OutletsParams } from '@/core/api';
import { queries } from '@/services/queries';

export const useOutlets = (options?: { enabled?: boolean }) => useQuery({ ...queries.outlets.all, enabled: options?.enabled ?? true });

/** One page of the outlets list (searched, filtered, sorted by the server); the page before stays while the next loads. */
export const useOutletList = (params: OutletsParams) => useQuery({ ...queries.outlets.list(params), placeholderData: keepPreviousData });

/** The previous area's outlets stay until the new ones arrive, so the pins do not blink on every pan. */
export const useOutletsIn = (area: Area | null) =>
  useQuery({ ...queries.outlets.inArea(area!), enabled: area !== null, placeholderData: keepPreviousData });

export type OutletDraft = OutletBody & { id?: number };

/** Creates the outlet, or updates it when the draft has an id; the outlets are fetched again afterwards. */
export const useSaveOutlet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: OutletDraft) => (id ? updateOutlet(id, body) : createOutlet(body)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queries.outlets._def }),
  });
};

/**
 * Deletes an outlet. The server refuses with 409 (and says what is left) while staff, admins, orders or stock point at it; that
 * error is the mutation's `error`, for the page to show. `onDeleted` runs on success (a detail page leaves for the list).
 */
export const useDeleteOutlet = (options?: { onDeleted?: () => void }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (o: Pick<Outlet, 'id'>) => deleteOutlet(o.id),
    onSuccess: () => {
      options?.onDeleted?.();
      return queryClient.invalidateQueries({ queryKey: queries.outlets._def });
    },
  });
};
