import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

/**
 * A choice drawn as a card: an icon, a title, a line of description and a tick that fills when chosen. Under it is a real
 * checkbox (or radio) input, so it works with the keyboard, a screen reader and a form's `register`/`Controller`. Use it
 * for the few options of a setting that deserve an explanation, instead of a bare checkbox.
 */
export function ChoiceCard({
  type = 'checkbox',
  checked,
  onChange,
  icon,
  title,
  description,
  disabled = false,
  className,
}: {
  type?: 'checkbox' | 'radio';
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <label
      className={cn(
        'group relative flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/40',
        checked ? 'border-ink bg-accent/50' : 'border-input bg-card hover:bg-accent/40',
        disabled && 'cursor-not-allowed opacity-60',
        className,
      )}
    >
      <input type={type} checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      {icon && <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', checked ? 'bg-ink text-background' : 'bg-muted text-muted-foreground')}>{icon}</span>}
      <span className="min-w-0 flex-1 space-y-0.5">
        <span className="block text-sm font-medium">{title}</span>
        {description && <span className="block text-xs text-muted-foreground">{description}</span>}
      </span>
      <span className={cn('mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border', checked ? 'border-ink bg-ink text-background' : 'border-input')} aria-hidden>
        {checked && <Check className="size-3" />}
      </span>
    </label>
  );
}
