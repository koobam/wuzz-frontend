import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * What a list shows when there is nothing to list: an icon, what is missing and why in two short lines, and up to two
 * buttons for what to do next (children: the buttons or links, drawn by the page). Flat, no shadow.
 */
export function EmptyState({ icon: Icon, title, description, children }: { icon: LucideIcon; title: string; description?: string; children?: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-3 text-center">
      <Icon className="size-10 text-muted-foreground" strokeWidth={1.5} aria-hidden />
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center justify-center gap-2">{children}</div>}
    </div>
  );
}
