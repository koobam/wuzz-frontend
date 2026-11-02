import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { useCatalog, useOnline, useOrders } from '@/core/pos/hooks';
import { setStatus } from '@/core/pos/orders';
import type { Order, OrderStatus } from '@/core/pos/types';
import { useConfirmAction } from '@/services/hooks/use-confirm-action';
import { useOrdersColumns } from './use-orders-columns';

/** The till's orders, as the server has them: the list, and moving one along its lifecycle (which needs a connection). */
export function useOrdersPage() {
  const queryClient = useQueryClient();
  const { data: orders = [], error: loadError } = useOrders();
  const catalog = useCatalog();
  const online = useOnline();
  const ask = useConfirmAction();
  const [error, setError] = useState<string | null>(null);

  const iconOf = useCallback((id: number) => catalog.data?.services.find((i) => i.id === id)?.icon ?? '', [catalog.data]);
  const move = useCallback(
    async (o: Order, to: OrderStatus, label: string) => {
      setError(null);
      if (!(await ask.moveOrder(o.code, label))) return;
      try {
        await setStatus(o.id, to);
        await queryClient.invalidateQueries({ queryKey: ['pos', 'orders'] });
      } catch (e) {
        setError((e as Error).message);
      }
    },
    [queryClient, ask],
  );

  const columns = useOrdersColumns({ iconOf, online, onMove: move });

  return {
    orders,
    columns,
    error: error ? new Error(error) : (loadError as Error | null),
  };
}
