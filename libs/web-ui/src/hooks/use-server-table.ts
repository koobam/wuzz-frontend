import { zodResolver } from '@hookform/resolvers/zod';
import type { OnChangeFn, SortingState } from '@tanstack/react-table';
import { useCallback, useMemo, useState } from 'react';
import { type Control, type DefaultValues, type Path, type PathValue, type Resolver, useForm, useWatch } from 'react-hook-form';
import type { z } from 'zod';
import { useDebounced } from './use-debounced';

type Filters = Record<string, string | number | boolean>;

/**
 * The state of a list that the SERVER searches, filters, sorts and pages: the search box (debounced), the filters, the sort
 * and the page. Everything a change touches goes back to the first page. `params` is what to send to the API; `active` says
 * whether a search or a filter is narrowing the list, so the page can offer "reset".
 *
 * The filters are a react-hook-form form typed by a zod `schema`: its defaults (`.default(...)`) are the resting values,
 * and what the page reads in `filters` has always passed the schema. `control` is there for filter controls that bind
 * to the form themselves.
 */
export function useServerTable<S extends z.ZodType<Filters, Filters>>({
  pageSize = 10,
  defaultSort = { id: 'id', desc: false },
  schema,
}: {
  pageSize?: number;
  defaultSort?: { id: string; desc?: boolean };
  /** The filters and their resting values, e.g. `z.object({ status: z.string().default(''), outlet: z.number().default(0) })`. */
  schema: S;
}) {
  type F = z.output<S>;
  const [search, setSearchText] = useState('');
  const q = useDebounced(search.trim());
  const [sorting, setSortingState] = useState<SortingState>([{ id: defaultSort.id, desc: !!defaultSort.desc }]);
  const [offset, setOffset] = useState(0);
  // The resting values, read once: what "reset" goes back to.
  const [rest] = useState<F>(() => schema.parse({}));

  const form = useForm<F>({ resolver: zodResolver(schema as never) as Resolver<F>, defaultValues: rest as DefaultValues<F> });
  const watched = useWatch({ control: form.control }) as Partial<F>;
  // Always what passed the schema: a value it refuses leaves the last good filters in place.
  const parsed = schema.safeParse(watched);
  const filters = (parsed.success ? parsed.data : rest) as F;

  const setSearch = useCallback((v: string) => {
    setSearchText(v);
    setOffset(0);
  }, []);
  const setFilter = useCallback(
    <K extends keyof F & string>(key: K, value: F[K]) => {
      form.setValue(key as unknown as Path<F>, value as unknown as PathValue<F, Path<F>>);
      setOffset(0);
    },
    [form],
  );
  const setSorting: OnChangeFn<SortingState> = useCallback((updater) => {
    setSortingState(updater);
    setOffset(0);
  }, []);
  const reset = useCallback(() => {
    setSearchText('');
    form.reset(rest as DefaultValues<F>);
    setOffset(0);
  }, [form, rest]);

  const active = q !== '' || (Object.keys(rest) as (keyof F)[]).some((k) => filters[k] !== rest[k]);
  const params = useMemo(
    () => ({ q, sort_by: sorting[0]?.id, sort_dir: sorting[0] ? (sorting[0].desc ? ('desc' as const) : ('asc' as const)) : undefined, limit: pageSize, offset }),
    [q, sorting, pageSize, offset],
  );

  return { search, setSearch, q, filters, setFilter, control: form.control as Control<F>, sorting, setSorting, offset, setOffset, pageSize, active, reset, params };
}

export type ServerTableState<F extends Filters = Filters> = {
  search: string;
  setSearch: (v: string) => void;
  q: string;
  filters: F;
  setFilter: <K extends keyof F & string>(key: K, value: F[K]) => void;
  sorting: SortingState;
  setSorting: OnChangeFn<SortingState>;
  offset: number;
  setOffset: (n: number) => void;
  pageSize: number;
  active: boolean;
  reset: () => void;
  params: { q: string; sort_by?: string; sort_dir?: 'asc' | 'desc'; limit: number; offset: number };
};
