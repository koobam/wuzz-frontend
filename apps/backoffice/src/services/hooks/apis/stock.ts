import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adjustStock, receiveStock, setStockMin, transferStock, wasteStock } from '@/core/api';
import type { MovementQuery, StockQuery } from '@/core/api';
import { queries } from '@/services/queries';

export const useStock = (params: StockQuery, options?: { enabled?: boolean }) =>
  useQuery({ ...queries.stock.list(params), placeholderData: keepPreviousData, enabled: options?.enabled ?? true });

export const useStockLowCount = (outletId: number | undefined, options?: { enabled?: boolean }) =>
  useQuery({ ...queries.stock.lowCount(outletId), enabled: options?.enabled ?? true });

export const useMovements = (params: MovementQuery) => useQuery({ ...queries.stock.movements(params), placeholderData: keepPreviousData });

/** A booking changes what is on hand and adds to the history: both are fetched again. */
const useStockMutation = <V, R>(mutationFn: (v: V) => Promise<R>) => {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn, onSuccess: () => queryClient.invalidateQueries({ queryKey: queries.stock._def }) });
};

export const useReceiveStock = () => useStockMutation(receiveStock);
export const useWasteStock = () => useStockMutation(wasteStock);
export const useAdjustStock = () => useStockMutation(adjustStock);
export const useTransferStock = () => useStockMutation(transferStock);
export const useSetStockMin = () => useStockMutation(setStockMin);
