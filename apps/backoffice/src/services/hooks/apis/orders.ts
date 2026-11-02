import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type OrderFilter, type OrdersParams, type OrderStatus, setOrderStatus } from '@/core/api';
import { queries } from '@/services/queries';

const EVERY_15_SECONDS = 15_000;

export const useOrders = (params: OrdersParams) =>
  useQuery({ ...queries.orders.list(params), placeholderData: keepPreviousData, refetchInterval: EVERY_15_SECONDS });

export const useOrderSummary = (filter: OrderFilter) =>
  useQuery({ ...queries.orders.summary(filter), placeholderData: keepPreviousData, refetchInterval: EVERY_15_SECONDS });

export const useOrder = (id: string) => useQuery({ ...queries.orders.detail(id), refetchInterval: EVERY_15_SECONDS });

export const useOrderStats = (range: { from: string; to: string }) =>
  useQuery({ ...queries.orders.stats(range), refetchInterval: EVERY_15_SECONDS });

/** Moves an order to another status; every list, summary and detail of orders is fetched again afterwards. */
export const useMoveOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, to }: { id: string; to: OrderStatus }) => setOrderStatus(id, to),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queries.orders._def }),
  });
};
