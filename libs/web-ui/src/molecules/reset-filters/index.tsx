import { RotateCcw } from 'lucide-react';

/** A small pill (or, with `block`, a full-width button under the filters) that puts the search and the filters back to how they began. Show it only while something is narrowing the list. */
export function ResetFilters({ label, onClick, block = false }: { label: string; onClick: () => void; block?: boolean }) {
  return (
    <button type="button" onClick={onClick} className={`items-center gap-1.5 rounded-full border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground ${block ? 'flex w-full justify-center border-input' : 'inline-flex border-transparent'}`}>
      <RotateCcw className="size-3.5" aria-hidden />
      {label}
    </button>
  );
}
