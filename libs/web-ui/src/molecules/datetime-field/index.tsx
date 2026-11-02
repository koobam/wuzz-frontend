import { CalendarDays, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Calendar } from '../../atoms/calendar';
import { cn } from '../../utils/cn';
import { TimePicker } from '../time-picker';

/** A moment as a form holds it: "YYYY-MM-DDTHH:mm" in the browser's zone, or "" for none. */
export type LocalDateTime = string;

const DATE = /^(\d{4})-(\d{2})-(\d{2})T([01]\d|2[0-3]):([0-5]\d)$/;
const two = (n: number) => String(n).padStart(2, '0');
const ymd = (d: Date) => `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`;

const split = (value: string) => {
  const m = DATE.exec(value);
  return m ? { date: new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])), time: `${m[4]}:${m[5]}` } : null;
};

/**
 * A date and a time of day as one field, optional: a button that opens a calendar, a time picker beside it (disabled until a
 * date is chosen) and a clear button. The value is "YYYY-MM-DDTHH:mm" in the browser's zone (what an `<input type=datetime-local>`
 * holds, and what `new Date(value)` reads as local time), or "" when nothing is set.
 */
export function DateTimeField({
  value,
  onChange,
  onBlur,
  id,
  language = 'en',
  defaultTime = '00:00',
  invalid = false,
  disabled = false,
  labels,
}: {
  value: LocalDateTime;
  onChange: (value: LocalDateTime) => void;
  onBlur?: () => void;
  id?: string;
  language?: string;
  /** The time a freshly chosen date gets. */
  defaultTime?: string;
  invalid?: boolean;
  disabled?: boolean;
  labels: { pickDate: string; timePlaceholder: string; clear: string; timeFirst: string; hour: string; minute: string; calendar: string };
}) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const parts = split(value);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const shown = parts ? new Intl.DateTimeFormat(language, { day: 'numeric', month: 'short', year: 'numeric' }).format(parts.date) : null;

  return (
    <div ref={box} className="relative grid grid-cols-[minmax(0,1fr)_7.5rem] gap-2">
      <div className="relative min-w-0">
        <button
          type="button"
          id={id}
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          onBlur={onBlur}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-invalid={invalid || undefined}
          className={cn(
            'flex w-full items-center gap-2 rounded-xl border bg-card py-3 pr-10 pl-4 text-left text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:opacity-60',
            invalid ? 'border-destructive' : 'border-input',
          )}
        >
          <CalendarDays className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className={cn('min-w-0 flex-1 truncate', !shown && 'text-muted-foreground')}>{shown ?? labels.pickDate}</span>
        </button>
        {parts && !disabled && (
          <button
            type="button"
            aria-label={labels.clear}
            title={labels.clear}
            onClick={() => onChange('')}
            className="absolute top-1/2 right-3 grid size-5 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        )}
      </div>
      <TimePicker
        value={parts?.time ?? ''}
        onChange={(time) => {
          if (!parts) return;
          onChange(`${ymd(parts.date)}T${time}`);
        }}
        disabled={disabled || !parts}
        disabledHint={labels.timeFirst}
        invalid={invalid}
        placeholder={labels.timePlaceholder}
        ariaLabel={labels.timePlaceholder}
        hourLabel={labels.hour}
        minuteLabel={labels.minute}
        minuteStep={5}
      />
      {open && (
        <div role="dialog" aria-label={labels.calendar} className="absolute top-full left-0 z-50 mt-2 max-w-[calc(100vw-2rem)] rounded-3xl border border-border bg-card p-3">
          <Calendar
            language={language}
            mode="single"
            selected={parts?.date}
            defaultMonth={parts?.date}
            onSelect={(d) => {
              if (!d) return;
              onChange(`${ymd(d)}T${parts?.time ?? defaultTime}`);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
