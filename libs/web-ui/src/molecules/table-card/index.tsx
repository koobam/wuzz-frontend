import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * The card around a table. The table is as tall as its rows (a page of them, e.g. 10, so it is always the same size) and
 * never scrolls up and down by itself: when the page is taller than the screen, the page scrolls. It scrolls sideways only
 * when its columns do not fit (the card then says so, so a sticky column can draw its edge). With nothing to list it keeps
 * some height, so an empty state has room to breathe. `footer` sits under the rows, inside the card (a key to the badges).
 */
export function TableCard({ children, empty, flat = false, toolbar, footer }: { children: ReactNode; empty?: ReactNode; flat?: boolean; toolbar?: ReactNode; footer?: ReactNode }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const measure = () => setOverflowing(el.scrollWidth > el.clientWidth + 1);
    measure();
    const watch = new ResizeObserver(measure);
    watch.observe(el);
    if (el.firstElementChild) watch.observe(el.firstElementChild);
    return () => watch.disconnect();
  }, []);

  return (
    <div data-overflow={overflowing} className={`group/tc flex flex-col overflow-hidden ${empty ? 'min-h-72' : ''} ${flat ? '' : 'rounded-3xl border border-border bg-card p-2'}`}>
      {toolbar && <div className="flex flex-wrap items-end gap-2 px-2 pt-1 pb-3">{toolbar}</div>}
      <div ref={scroller} className="overflow-x-auto [scrollbar-width:thin]">{children}</div>
      {empty && (typeof empty === 'string' ? <p className="p-6 text-center text-sm text-muted-foreground">{empty}</p> : <div className="px-6 py-12">{empty}</div>)}
      {footer}
    </div>
  );
}
