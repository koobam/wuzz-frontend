import { flexRender, getCoreRowModel, useReactTable, type ColumnDef, type OnChangeFn, type RowData, type SortingState } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { Td } from '../../atoms/table-cell';
import { TableCard } from '../../molecules/table-card';

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Classes for the column's cells, e.g. `whitespace-nowrap`. */
    className?: string;
    /** Keeps the column in view at that edge while the table scrolls sideways (the Actions column). */
    sticky?: 'right';
  }
}

// A sticky column covers what scrolls under it with the card's own background (mixed with the row's hover tint while the row is hovered, so the cell hovers with its row), and draws its edge only while the table overflows.
const STICKY_HEAD = 'right-0 z-20 pl-6! group-data-[overflow=true]/tc:border-l group-data-[overflow=true]/tc:border-border';
const STICKY_CELL = 'sticky right-0 z-[5] pl-6! bg-card group-hover/row:bg-[color-mix(in_oklab,var(--color-card),var(--color-accent)_40%)] group-data-[overflow=true]/tc:border-l group-data-[overflow=true]/tc:border-border';

/** A table driven by TanStack Table: give it the rows and the column definitions (`header`, `cell`, `meta.className`). */
export function DataTable<T>({
  data,
  columns,
  rowId,
  empty,
  flat = false,
  toolbar,
  footer,
  sorting,
  onSortingChange,
}: {
  toolbar?: ReactNode;
  /** Under the rows, inside the card: the key to the table's badges (`BadgeLegend`). */
  footer?: ReactNode;
  /** With `onSortingChange`, headers of sortable columns become buttons. The rows are sorted by whoever supplies them (the server), not here. */
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  data: T[];
  columns: ColumnDef<T>[];
  rowId: (row: T) => string;
  empty?: ReactNode;
  flat?: boolean;
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: rowId,
    state: { sorting: sorting ?? [] },
    onSortingChange,
    manualSorting: true,
    enableSorting: !!onSortingChange,
    enableMultiSort: false,
  });
  const groups = table.getHeaderGroups();
  return (
    <TableCard empty={empty} flat={flat} toolbar={toolbar} footer={footer}>
      <table className="w-full min-w-max text-left text-sm">
        <thead className="text-xs text-muted-foreground">
          {groups.map((g) => (
            <tr key={g.id}>
              {g.headers.map((h, i) => (
                <th
                  key={h.id}
                  aria-sort={{ asc: 'ascending', desc: 'descending' }[h.column.getIsSorted() as string] as 'ascending' | 'descending' | undefined}
                  className={`sticky top-0 z-10 bg-muted px-4 py-3 font-medium ${h.column.columnDef.meta?.sticky === 'right' ? STICKY_HEAD : ''} ${i === 0 ? 'rounded-l-2xl' : ''} ${i === g.headers.length - 1 ? 'rounded-r-2xl' : ''}`}
                >
                  {h.column.getCanSort() ? (
                    <button type="button" onClick={h.column.getToggleSortingHandler()} className="inline-flex items-center gap-1 hover:text-foreground">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {{ asc: <ArrowUp className="size-3" />, desc: <ArrowDown className="size-3" /> }[h.column.getIsSorted() as string] ?? (
                        <ChevronsUpDown className="size-3 opacity-50" />
                      )}
                    </button>
                  ) : (
                    flexRender(h.column.columnDef.header, h.getContext())
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-border [&_tr]:hover:bg-accent/40">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="group/row">
              {row.getVisibleCells().map((cell) => (
                <Td key={cell.id} className={`${cell.column.columnDef.meta?.className ?? ''} ${cell.column.columnDef.meta?.sticky === 'right' ? STICKY_CELL : ''}`}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </TableCard>
  );
}
