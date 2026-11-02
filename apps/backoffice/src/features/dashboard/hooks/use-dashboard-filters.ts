import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import type { DayRange } from '@wuzz/web-ui';
import { type DashboardFilters, type DashboardFiltersInput, dashboardFiltersSchema } from '../utils/dashboard-filters.schema';

/** The dashboard's filters as a form typed by its schema: the range, and the search and status of the latest orders. */
export function useDashboardFilters() {
  const form = useForm<DashboardFiltersInput, unknown, DashboardFilters>({ resolver: zodResolver(dashboardFiltersSchema), defaultValues: dashboardFiltersSchema.parse({}) });
  const { from, to, search, status } = useWatch({ control: form.control }) as DashboardFilters;
  const range: DayRange = { from, to };
  return {
    range,
    search,
    status,
    setRange: (r: DayRange) => {
      form.setValue('from', r.from);
      form.setValue('to', r.to);
    },
    setSearch: (v: string) => form.setValue('search', v),
    setStatus: (v: string) => form.setValue('status', v),
  };
}
