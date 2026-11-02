import { ChevronRight } from 'lucide-react';
import { Fragment, type ReactNode } from 'react';

export type Crumb = {
  label: ReactNode;
  /** Draws the crumb as a link: given the class to put on it. The last crumb (where you are) needs none. */
  link?: (className: string) => ReactNode;
};

const LINK = 'rounded-md px-1 py-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground';

/** Where the page is in the app: `Home › Services › Add service`. The last crumb is the current page and is not a link. */
export function Breadcrumb({ items, label }: { items: Crumb[]; label: string }) {
  return (
    <nav aria-label={label}>
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <Fragment key={i}>
              <li className="flex items-center" {...(last ? { 'aria-current': 'page' as const } : {})}>
                {last || !item.link ? <span className={`px-1 py-0.5 ${last ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{item.label}</span> : item.link(LINK)}
              </li>
              {!last && <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/70" aria-hidden />}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
