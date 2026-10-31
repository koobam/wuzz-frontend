import { MoreHorizontal } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/** A "more" button for a table row: the less common actions in a small list. Drawn on the page itself, so a table's scroll box cannot clip it. */
export function RowMenu({ label, items }: { label: string; items: { label: string; onSelect: () => void }[] }) {
  const button = useRef<HTMLButtonElement>(null);
  const [at, setAt] = useState<{ right: number; top: number } | null>(null);

  useEffect(() => {
    if (!at) return;
    const close = () => setAt(null);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [at]);

  return (
    <>
      <button
        ref={button}
        type="button"
        aria-haspopup="menu"
        aria-expanded={at !== null}
        aria-label={label}
        title={label}
        onClick={() => {
          const r = button.current?.getBoundingClientRect();
          setAt(at || !r ? null : { right: window.innerWidth - r.right, top: r.bottom + 6 });
        }}
        className="grid size-8 place-items-center rounded-full border border-input bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <MoreHorizontal className="size-4" />
      </button>
      {at &&
        createPortal(
          <>
            <div className="fixed inset-0 z-40" onMouseDown={() => setAt(null)} />
            <div role="menu" style={{ right: at.right, top: at.top }} className="fixed z-50 min-w-48 rounded-2xl border border-border bg-card p-1.5 animate-[dialog-in_120ms_ease-out_both] motion-reduce:animate-none">
              {items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setAt(null);
                    item.onSelect();
                  }}
                  className="block w-full rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
