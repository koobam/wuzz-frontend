import type { ReactNode } from 'react';

/**
 * A card of a form: a small title (and a line under it), then its fields in a responsive grid that fills the width. A
 * field spans more cells with `sm:col-span-2`, `lg:col-span-3` or `col-span-full` on its own wrapper.
 */
export function FormSection({ title, description, children, columns = 3 }: { title?: ReactNode; description?: ReactNode; children: ReactNode; columns?: 1 | 2 | 3 | 'auto' }) {
  const grid = columns === 1 ? '' : columns === 'auto' ? 'grid-cols-[repeat(auto-fit,minmax(13rem,1fr))]' : columns === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3';
  return (
    <section className="space-y-4 rounded-3xl border border-border bg-card p-5">
      {(title || description) && (
        <div className="space-y-0.5">
          {title && <h2 className="text-sm font-semibold">{title}</h2>}
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      )}
      <div className={`grid gap-4 ${grid}`}>{children}</div>
    </section>
  );
}

/** The row at the end of a form: the primary action first (Save / Create), then the others. */
export function FormActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}
