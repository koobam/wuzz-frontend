import type { ReactNode } from 'react';
import { Badge, type BadgeTone } from '../../atoms/badge';

/** One badge of a table, and what it means. */
export type LegendItem = { tone: BadgeTone; label: string; description: string };

/**
 * The key to a table's badges, for its footer: each badge as the cells draw it, followed by a sentence on what it means. A
 * table lists only the badges it can actually show, so the key and the cells never disagree.
 */
export function BadgeLegend({ items, title }: { items: LegendItem[]; title?: ReactNode }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap items-start gap-x-6 gap-y-2 border-t border-border px-2 pt-3 pb-1 text-xs text-muted-foreground">
      {title && <span className="font-medium text-foreground">{title}</span>}
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-2">
          <Badge tone={item.tone}>{item.label}</Badge>
          <span>{item.description}</span>
        </span>
      ))}
    </div>
  );
}
