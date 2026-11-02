import { useId, type ReactNode } from 'react';
import { ControlShapeContext } from '../../utils/portal-target';

/**
 * A label (and an optional hint) over any control, and the message about it under: the frame of every form field. For a
 * text box use `TextField`; use this for a select, a checkbox group or a custom control. The control gets the id to link
 * the label to it through the render prop.
 */
export function Field({
  label,
  hint,
  error,
  required,
  className = '',
  children,
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  /** Adds the asterisk after the label. */
  required?: boolean;
  className?: string;
  children: (id: string) => ReactNode;
}) {
  const id = useId();
  return (
    <div className={`min-w-0 space-y-1.5 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
        {required && <span className="ml-0.5 text-destructive" aria-hidden>*</span>}
      </label>
      <ControlShapeContext.Provider value="field">{children(id)}</ControlShapeContext.Provider>
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
