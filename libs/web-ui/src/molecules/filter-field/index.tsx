import type { ReactNode } from 'react';

/**
 * A filter of a list with its name above it, so nobody has to guess what a dropdown narrows. The control keeps the toolbar's
 * pill shape (see `Select`, `Input shape="pill"`); the field stretches like the controls did (`min-w-40 flex-1`) and, in a
 * toolbar that aligns to the bottom (`items-end`), lines every control up on the same baseline.
 */
export function FilterField({ label, className = '', children }: { label: ReactNode; className?: string; children: ReactNode }) {
  return (
    <div className={`flex min-w-40 flex-1 flex-col gap-1 ${className}`}>
      <span className="px-1 text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}
