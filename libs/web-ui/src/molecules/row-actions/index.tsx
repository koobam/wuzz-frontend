import type { ColumnDef } from '@tanstack/react-table';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

const BUTTON =
  'grid size-9 shrink-0 place-items-center rounded-full border border-transparent text-muted-foreground transition-colors outline-none hover:border-input hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-40';
const DANGER = 'hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive';

/**
 * One action of a row. Either `onClick` (a button) or `link` (a page: the lib has no router, so the caller draws its own
 * link with the class, the icon and the label it is given: the link needs the label as its accessible name and tooltip).
 */
export type RowAction = {
  label: string;
  onClick?: () => void;
  link?: (link: { className: string; icon: ReactNode; label: string }) => ReactNode;
  disabled?: boolean;
};
/** An action beyond the three standard ones (an order's "start", a stock's "receive"): it brings its own icon. */
export type RowExtraAction = RowAction & { icon: ReactNode; danger?: boolean };

function Item({ action, icon, danger = false }: { action: RowAction; icon: ReactNode; danger?: boolean }) {
  const className = cn(BUTTON, danger && DANGER);
  if (action.link && !action.disabled) return <>{action.link({ className, icon, label: action.label })}</>;
  return (
    <button type="button" onClick={action.onClick} disabled={action.disabled} aria-label={action.label} title={action.label} className={className}>
      {icon}
    </button>
  );
}

/**
 * The icon buttons at the end of a row, the same in every table: view (an eye), then any `extra` actions, then edit (a
 * pencil) and delete (a bin). Each is optional and left out when not given, so a table shows only what its records can do.
 */
export function RowActions({ view, edit, remove, extra = [] }: { view?: RowAction; edit?: RowAction; remove?: RowAction; extra?: RowExtraAction[] }) {
  return (
    <span className="flex items-center justify-end gap-0.5">
      {view && <Item action={view} icon={<Eye className="size-4" aria-hidden />} />}
      {extra.map((a) => (
        <Item key={a.label} action={a} icon={a.icon} danger={a.danger} />
      ))}
      {edit && <Item action={edit} icon={<Pencil className="size-4" aria-hidden />} />}
      {remove && <Item action={remove} icon={<Trash2 className="size-4" aria-hidden />} danger />}
    </span>
  );
}

/** The Actions column every table ends with: icon-only, as narrow as its buttons, header and cells at the right, not sortable. */
export function actionsColumn<T>({ header, cell }: { header: string; cell: (row: T) => ReactNode }): ColumnDef<T> {
  return {
    id: 'actions',
    enableSorting: false,
    header: () => <span className="block text-right">{header}</span>,
    meta: { className: 'w-px whitespace-nowrap', sticky: 'right' },
    cell: ({ row }) => cell(row.original),
  };
}
