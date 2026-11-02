import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type Bom, type BomBody, type BomOwner, calcCost, type CalcBody, putBom } from '@/core/api';
import { queries } from '@/services/queries';

export const useBom = (owner: BomOwner, id: number) => useQuery(queries.costing.bom(owner, id));

/** The recipe is saved, and the cached copy replaced with the server's answer (its costs included). */
export const usePutBom = (owner: BomOwner, id: number, options?: { onSaved?: (bom: Bom) => void }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: BomBody) => putBom(owner, id, body),
    onSuccess: (next) => {
      queryClient.setQueryData(queries.costing.bom(owner, id).queryKey, next);
      options?.onSaved?.(next);
    },
  });
};

export const useServiceCosting = (serviceId: number | null) => useQuery({ ...queries.costing.service(serviceId!), enabled: serviceId !== null });

/** What the services cost is fetched again (after a recipe changed). */
export const useRefreshCosting = () => {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: queries.costing.service._def });
};

export const useCalcCost = () => useMutation({ mutationFn: (body: CalcBody) => calcCost(body) });
