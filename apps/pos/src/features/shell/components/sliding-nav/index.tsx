import { Link, useRouterState } from '@tanstack/react-router';
import { useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from '@/core/utils/i18n';

export type NavItem = { to: string; label: string; exact?: boolean };

const TAB = 'relative z-10 rounded-full px-4 py-2 text-sm whitespace-nowrap transition-colors duration-200';

/**
 * The tab pills. One dark pill sits behind the active tab and slides to the next one when the page changes, instead of
 * each tab switching its own colour. It is measured from the tab itself, so it follows a different language's wider labels.
 */
export function SlidingNav({ items, className = '' }: { items: readonly NavItem[]; className?: string }) {
  const { t, i18n } = useTranslation();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const nav = useRef<HTMLElement>(null);
  const tabs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [box, setBox] = useState<{ left: number; width: number } | null>(null);
  // The first placement must not slide in from the corner.
  const [settled, setSettled] = useState(false);

  const active = items.findIndex((i) => (i.exact || i.to === '/' ? pathname === i.to : pathname === i.to || pathname.startsWith(`${i.to}/`)));

  useLayoutEffect(() => {
    const place = () => {
      const el = active >= 0 ? tabs.current[active] : null;
      setBox(el ? { left: el.offsetLeft, width: el.offsetWidth } : null);
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
      {items.map((item, i) => (
        <Link
          key={item.to}
          ref={(el) => {
            tabs.current[i] = el;
          }}
          to={item.to}
          className={`${TAB} ${i === active ? 'font-medium text-background' : 'text-muted-foreground hover:text-foreground'}`}
        >
          {t(item.label)}
        </Link>
      ))}
    </nav>
  );
}
