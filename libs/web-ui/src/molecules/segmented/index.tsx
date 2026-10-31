import { useRef, type ReactNode } from 'react';
import { cn } from '../../utils/cn';

export type SegmentedOption<V extends string> = { value: V; label: ReactNode; /** Left out of the control (kept for a state the data does not support yet). */ hidden?: boolean };

/**
 * A few mutually exclusive choices drawn as one pill: the chosen one is raised on a flat white segment. A real radio group:
 * one tab stop, the arrow keys move the choice, Home/End jump. For two to four short options, e.g. Open / Closed.
 */
export function Segmented<V extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  disabled = false,
  className,
}: {
  value: V;
  onChange: (value: V) => void;
  options: SegmentedOption<V>[];
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
}) {
  const shown = options.filter((o) => !o.hidden);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const move = (from: number, step: number) => {
    const next = (from + step + shown.length) % shown.length;
    onChange(shown[next]!.value);
    refs.current[next]?.focus();
  };

  return (
    <div role="radiogroup" aria-label={ariaLabel} className={cn('inline-flex h-11 items-stretch gap-0.5 rounded-xl border border-input bg-muted/50 p-0.5', disabled && 'opacity-60', className)}>
      {shown.map((o, i) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            disabled={disabled}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowDown') (e.preventDefault(), move(i, 1));
              else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') (e.preventDefault(), move(i, -1));
              else if (e.key === 'Home') (e.preventDefault(), move(0, 0));
              else if (e.key === 'End') (e.preventDefault(), move(shown.length - 1, 0));
            }}
            className={cn(
              'flex-1 rounded-[10px] px-2.5 text-sm whitespace-nowrap transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none',
              on ? 'border border-border bg-card font-medium text-foreground' : 'border border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
