import type { ColumnDef } from '@tanstack/react-table';
import { SearchX } from 'lucide-react';
import type { ReactNode } from 'react';
import type { ServerTableState } from '../../hooks/use-server-table';
import { EmptyState } from '../../molecules/empty-state';
import { Pagination } from '../../molecules/pagination';
import { ResetFilters } from '../../molecules/reset-filters';
import { SearchBox } from '../../molecules/search-box';
import { buttonClass } from '../../styles/tokens';
import { DataTable } from '../data-table';

export type ServerTableLabels = {
  /** The visible name of the search box ("Search"); the placeholder says what it looks through. */
  searchLabel: string;
  searchPlaceholder: string;
  /** "Showing 1–10 of 13 bookings". */
  showing: (from: number, to: number, total: number) => string;
  previous: string;
  next: string;
  reset: string;
  /** What the list says when a search or a filter leaves nothing. */
  noResultsTitle: string;
  noResultsDescription: string;
};

/**
 * A list that the server searches, filters, sorts and pages: a search box, the page's own filters, a reset while anything
 * narrows the list, the table with sortable headers, an empty state, and the pager. Drive it with `useServerTable`.
 */
export function ServerTable<T>({
  state,
  data,
  total,
  ready,
  columns,
  rowId,
  filters,
  labels,
  emptyState,
  legend,
}: {
  state: Omit<ServerTableState<any>, 'setFilter'>; // eslint-disable-line @typescript-eslint/no-explicit-any
  data: T[];
  total: number;
  /** False until the first answer from the server, so "nothing here" is not shown while it is still loading. */
  ready: boolean;
  columns: ColumnDef<T>[];
  rowId: (row: T) => string;
  /** The page's own filters (selects, a date range...), shown after the search box. */
  filters?: ReactNode;
  labels: ServerTableLabels;
  /** What an empty list says when nothing is narrowing it: an icon, a title, two lines, and up to two buttons. */
  emptyState: ReactNode;
  /** The key to the table's badges, drawn in the footer of the card (a `BadgeLegend`). */
  legend?: ReactNode;
}) {
  const empty =
    ready && data.length === 0 ? (
      state.active ? (
        <EmptyState icon={SearchX} title={labels.noResultsTitle} description={labels.noResultsDescription}>
          <button type="button" className={buttonClass} onClick={state.reset}>
            {labels.reset}
          </button>
        </EmptyState>
      ) : (
        emptyState
      )
    ) : undefined;

  return (
    <>
      <DataTable
        toolbar={
          <>
            <SearchBox value={state.search} onChange={state.setSearch} placeholder={labels.searchPlaceholder} label={labels.searchLabel} />
            {filters}
            {state.active && <ResetFilters label={labels.reset} onClick={state.reset} />}
          </>
        }
        sorting={state.sorting}
        onSortingChange={state.setSorting}
        data={data}
        columns={columns}
        rowId={rowId}
        empty={empty}
        footer={legend}
      />
      <Pagination offset={state.offset} pageSize={state.pageSize} total={total} showing={labels.showing} previous={labels.previous} next={labels.next} onChange={state.setOffset} />
    </>
  );
}
