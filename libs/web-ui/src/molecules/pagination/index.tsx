import { buttonClass } from '../../styles/tokens';

/** "Showing 1–10 of 13" and previous/next, under a list. The page is an offset, as the server's list calls take it. */
export function Pagination({
  offset,
  pageSize,
  total,
  showing,
  previous,
  next,
  onChange,
}: {
  offset: number;
  pageSize: number;
  total: number;
  /** The sentence for the range on show; it is the page's to translate. */
  showing: (from: number, to: number, total: number) => string;
  previous: string;
  next: string;
  onChange: (offset: number) => void;
}) {
  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>{total > 0 ? showing(offset + 1, Math.min(offset + pageSize, total), total) : ''}</span>
      <span className="space-x-2">
        <button type="button" className={buttonClass} disabled={offset === 0} onClick={() => onChange(Math.max(0, offset - pageSize))}>
          {previous}
        </button>
        <button type="button" className={buttonClass} disabled={offset + pageSize >= total} onClick={() => onChange(offset + pageSize)}>
          {next}
        </button>
      </span>
    </div>
  );
}
