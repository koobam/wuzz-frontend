import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type MovementQuery, receiveStock, type StockQuery, wasteStock, type WasteReason } from '@/core/api';
import { queries } from '@/services/queries';

export const useStock = (params: StockQuery, options: { enabled: boolean }) =>
  useQuery({ ...queries.stock.list(params), placeholderData: keepPreviousData, enabled: options.enabled });

export const useMovements = (params: MovementQuery, options: { enabled: boolean }) =>
  useQuery({ ...queries.stock.movements(params), placeholderData: keepPreviousData, enabled: options.enabled });

type Record =
  | { action: 'waste'; material_id: number; qty: string; reason: WasteReason; note?: string; idempotency_key: string }
  | { action: 'receipt'; material_id: number; qty: string; total_cost: number; supplier?: string; doc_no?: string; note?: string; idempotency_key: string };

/** Books waste or goods received; the stock and its history are fetched again afterwards. */
export const useRecordStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (b: Record) => (b.action === 'waste' ? wasteStock(b) : receiveStock(b)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queries.stock._def }),
  });
};
