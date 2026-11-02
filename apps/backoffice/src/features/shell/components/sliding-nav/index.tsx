import { Link, useRouterState } from '@tanstack/react-router';
import { ChevronDown } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '@/core/utils/i18n';
import type { NavChild } from '@/config/navigation';

export type NavItem = { to: string; label: string; exact?: boolean; children?: readonly NavChild[] };

const TAB = 'relative z-10 rounded-full px-2.5 py-2 sm:px-3 lg:px-4 text-sm whitespace-nowrap transition-colors duration-200';
// The dropdown lays its pages out side by side: each gets a column wide enough for its description, so the menu grows with
// the number of pages (and shrinks to the screen on a narrow one).
const COLUMN_WIDTH = 250;
const MENU_PADDING = 16;
const MENU_MARGIN = 12;

const matches = (pathname: string, to: string, exact?: boolean) =>
  exact || to === '/' ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);

/**
 * The tab pills. One dark pill sits behind the active tab and slides to the next one when the page changes, instead of
 * each tab switching its own colour. It is measured from the tab itself, so it follows a different language's wider labels.
 * A tab with children is a dropdown.
 */
export function SlidingNav({ items, className = '' }: { items: readonly NavItem[]; className?: string }) {
  const { t, i18n } = useTranslation();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const nav = useRef<HTMLElement>(null);
  const tabs = useRef<(HTMLElement | null)[]>([]);
  const [box, setBox] = useState<{ left: number; width: number } | null>(null);
  // The first placement must not slide in from the corner.
  const [settled, setSettled] = useState(false);

  const active = items.findIndex((i) => matches(pathname, i.to, i.exact) || i.children?.some((c) => matches(pathname, c.to)));

  useLayoutEffect(() => {
    const place = () => {
      const el = active >= 0 ? tabs.current[active] : null;
      setBox(el ? { left: el.offsetLeft, width: el.offsetWidth } : null);
      // On a phone the row scrolls: bring the current tab into view.
      if (el && nav.current && nav.current.scrollWidth > nav.current.clientWidth) nav.current.scrollTo({ left: Math.max(0, el.offsetLeft - 12), behavior: 'auto' });
    };
    place();
    const frame = requestAnimationFrame(() => setSettled(true));
    const watch = new ResizeObserver(place);
    if (nav.current) watch.observe(nav.current);
    return () => {
      cancelAnimationFrame(frame);
      watch.disconnect();
    };
  }, [active, i18n.language]);

  return (
    <nav ref={nav} aria-label="Main" className={`relative flex items-center gap-1 overflow-x-auto rounded-full border border-border bg-card p-1.5 ${className}`}>
      {box && (
        <span
          aria-hidden
          className={`absolute top-1.5 bottom-1.5 rounded-full bg-ink motion-reduce:transition-none ${settled ? 'transition-[left,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]' : ''}`}
          style={{ left: box.left, width: box.width }}
        />
      )}
      {items.map((item, i) => {
        const tone = `${TAB} ${i === active ? 'font-medium text-background' : 'text-muted-foreground hover:text-foreground'}`;
        return item.children ? (
          <NavMenu
            key={item.to}
            item={item}
            className={tone}
            pathname={pathname}
            tabRef={(el) => {
              tabs.current[i] = el;
            }}
          />
        ) : (
          <Link
            key={item.to}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            to={item.to}
            className={tone}
          >
            {t(item.label)}
          </Link>
        );
      })}
    </nav>
  );
}

/** A tab that opens a list of pages: on hover, on click, or from the keyboard. Drawn in a portal so the pill's scroll box cannot clip it. */
function NavMenu({ item, className, pathname, tabRef }: { item: NavItem; className: string; pathname: string; tabRef: (el: HTMLElement | null) => void }) {
  const { t } = useTranslation();
  const trigger = useRef<HTMLButtonElement | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const [at, setAt] = useState<{ left: number; top: number; width: number } | null>(null);

  const show = () => {
    window.clearTimeout(timer.current);
    const r = trigger.current?.getBoundingClientRect();
    if (!r) return;
    const width = Math.min((item.children?.length ?? 1) * COLUMN_WIDTH + MENU_PADDING, window.innerWidth - 2 * MENU_MARGIN);
    // Centred under the tab, pulled back inside the screen when the tab is near an edge.
    const centred = r.left + r.width / 2 - width / 2;
    setAt({ left: Math.max(MENU_MARGIN, Math.min(centred, window.innerWidth - width - MENU_MARGIN)), top: r.bottom + 10, width });
  };
  const hide = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAt(null), 120);
  };

  useEffect(() => setAt(null), [pathname]);
  useEffect(() => {
    if (!at) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setAt(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [at]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <>
      <button
        type="button"
        ref={(el) => {
          trigger.current = el;
          tabRef(el);
        }}
        aria-haspopup="menu"
        aria-expanded={at !== null}
        onMouseEnter={show}
        onMouseLeave={hide}
        onClick={() => (at ? setAt(null) : show())}
        onKeyDown={(e) => e.key === 'ArrowDown' && show()}
        className={className}
      >
        <span className="flex items-center gap-1">
          {t(item.label)}
          <ChevronDown aria-hidden className={`size-4 transition-transform duration-200 motion-reduce:transition-none ${at ? 'rotate-180' : ''}`} />
        </span>
      </button>
      {at &&
        createPortal(
          <div
            role="menu"
            style={{ left: at.left, top: at.top, width: at.width }}
            onMouseEnter={show}
            onMouseLeave={hide}
            className="fixed z-50 flex gap-1 rounded-3xl border border-border bg-card p-2 animate-[dialog-in_140ms_ease-out_both] motion-reduce:animate-none"
          >
            {item.children?.map((c) => {
              const here = matches(pathname, c.to);
              return (
                <Link
                  key={c.to}
                  to={c.to}
                  role="menuitem"
                  className={`flex min-w-0 flex-1 items-start gap-3 rounded-2xl p-3 transition-colors hover:bg-accent ${here ? 'bg-accent/60' : ''}`}
                >
                  <c.icon className="mt-0.5 size-5 shrink-0" />
                  <span className="flex min-w-0 flex-col">
                    <span className="text-sm font-medium">{t(c.label)}</span>
                    <span className="text-xs text-muted-foreground">{t(c.description)}</span>
                  </span>
                </Link>
              );
            })}
          </div>,
          document.body,
        )}
    </>
  );
}
