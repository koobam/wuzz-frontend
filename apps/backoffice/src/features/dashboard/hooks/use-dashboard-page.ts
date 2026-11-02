import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { Area } from '@/core/api';
import { greetingKey } from '@/core/utils/greeting';
import { useTranslation } from '@/core/utils/i18n';
import { useOrders, useOrderStats, useOutlets, useOutletsIn, useServices } from '@/services/hooks/apis';
import { useSession } from '@/services/hooks/use-session';
import { queries } from '@/services/queries';
import { summarize } from '../utils/stats';
import { useDashboardFilters } from './use-dashboard-filters';

/** What the dashboard shows: orders (stats and the latest), outlets and services. */
const SHOWN: string[] = [queries.orders._def[0], queries.outlets._def[0], queries.services._def[0]];
const isShown = (q: { queryKey: readonly unknown[] }) => SHOWN.includes(q.queryKey[0] as string);

/** Everything the dashboard does: the date range, the latest-orders filters, the map's area, the refresh, and the numbers. */
export function useDashboardPage() {
  const { t, i18n } = useTranslation();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { range, setRange, search, setSearch, status, setStatus } = useDashboardFilters();
  // The map reports the area it shows once it has stood still; only the outlets in that area are fetched. The
  // previous ones stay on screen until the new ones arrive, so the pins do not blink on every pan.
  const [area, setArea] = useState<Area | null>(null);

  const stats = useOrderStats(range);
  const outlets = useOutlets();
  const inView = useOutletsIn(area);
  const services = useServices();
  const orders = useOrders({ status, limit: 5 });

  const dayFmt = new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'short' });
  const needle = search.trim().toLowerCase();

  return {
    title: t(greetingKey(), { name: session?.user.name.split(' ')[0] ?? '' }),
    range,
    setRange,
    refreshing: useIsFetching({ predicate: isShown }) > 0,
    refresh: () => void queryClient.invalidateQueries({ predicate: isShown }),
    error: stats.error ?? outlets.error ?? services.error ?? orders.error,
    stats: stats.data,
    summary: summarize(stats.data),
    rangeText: { from: dayFmt.format(new Date(`${range.from}T00:00:00`)), to: dayFmt.format(new Date(`${range.to}T00:00:00`)) },
    outlets: outlets.data,
    shownOutlets: inView.data ?? outlets.data ?? [],
    setArea,
    services: services.data,
    search,
    setSearch,
    status,
    setStatus,
    recent: (orders.data?.items ?? []).filter((o) => !needle || o.customer_name.toLowerCase().includes(needle) || o.id.toLowerCase().startsWith(needle)),
  };
}
