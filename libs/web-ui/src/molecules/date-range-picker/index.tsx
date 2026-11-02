import { CalendarDays, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { Calendar } from '../../atoms/calendar';
import { useTranslation } from 'react-i18next';

/** A range of days, both ends included, as YYYY-MM-DD in the browser's calendar. */
export type DayRange = { from: string; to: string };

/** The longest range the dashboard can draw (the server refuses more). */
export const MAX_RANGE_DAYS = 92;

export const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const parse = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y!, m! - 1, d!);
};
const daysBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 86_400_000) + 1;

const today = () => new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
const lastDays = (n: number): DayRange => {
  const to = today();
  const from = new Date(to);
  from.setDate(from.getDate() - (n - 1));
  return { from: ymd(from), to: ymd(to) };
};
const thisMonth = (): DayRange => {
  const t = today();
  return { from: ymd(new Date(t.getFullYear(), t.getMonth(), 1)), to: ymd(t) };
};

export const PRESETS = [
  { key: 'today', range: () => lastDays(1) },
  { key: 'last7', range: () => lastDays(7) },
  { key: 'last14', range: () => lastDays(14) },
  { key: 'last30', range: () => lastDays(30) },
  { key: 'thisMonth', range: thisMonth },
] as const;

export const defaultRange = () => lastDays(7);

/**
 * A pill that shows the chosen range and opens a panel: quick ranges on the left, a calendar on the right for any
 * other. A quick range applies at once; a calendar range applies with the button, once both ends are picked.
 */
export function DateRangePicker({
  value,
  onChange,
  onClear,
  maxDays = MAX_RANGE_DAYS,
}: {
  /** null = no range chosen (only with `onClear`: "all time"). */
  value: DayRange | null;
  onChange: (range: DayRange) => void;
  /** When given, the panel offers "all time", which clears the range. */
  onClear?: () => void;
  /** The longest range the page can use; the dashboard's is 92 days. */
  maxDays?: number;
}) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>();
  const box = useRef<HTMLDivElement>(null);

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

  const short = new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'short' });
  const full = new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'short', year: 'numeric' });
  const preset = value ? PRESETS.find((p) => {
    const r = p.range();
    return r.from === value.from && r.to === value.to;
  }) : undefined;
  const label = !value
    ? t('range.all')
    : preset
      ? t(`range.${preset.key}`)
      : value.from === value.to
        ? full.format(parse(value.from))
        : `${short.format(parse(value.from))} – ${full.format(parse(value.to))}`;

  const pick = (range: DayRange) => {
    onChange(range);
    setOpen(false);
  };
  const toggle = () => {
    if (!open) setDraft(value ? { from: parse(value.from), to: parse(value.to) } : undefined);
    setOpen((o) => !o);
  };

  const complete = draft?.from && draft.to;
  const tooLong = complete && daysBetween(draft.from!, draft.to!) > maxDays;

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="flex items-center gap-2 rounded-full border border-input bg-card px-4 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
      >
        <CalendarDays className="size-4 text-muted-foreground" aria-hidden />
        {label}
        <ChevronDown className={`size-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>

      {open ? (
        <div role="dialog" aria-label={t('range.title')} className="absolute right-0 z-50 mt-2 flex max-w-[calc(100vw-2rem)] flex-col rounded-3xl border border-border bg-card p-3 sm:flex-row">
          <div className="flex gap-1 overflow-x-auto pb-2 sm:w-40 sm:shrink-0 sm:flex-col sm:overflow-visible sm:border-r sm:border-border sm:pr-3 sm:pb-0">
            {onClear && (
              <button
                type="button"
                onClick={() => {
                  onClear();
                  setOpen(false);
                }}
                className={`rounded-xl px-3 py-2 text-left text-sm whitespace-nowrap transition-colors hover:bg-accent ${!value ? 'bg-accent font-medium' : ''}`}
              >
                {t('range.all')}
              </button>
            )}
            {PRESETS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => pick(p.range())}
                className={`rounded-xl px-3 py-2 text-left text-sm whitespace-nowrap transition-colors hover:bg-accent ${preset?.key === p.key ? 'bg-accent font-medium' : ''}`}
              >
                {t(`range.${p.key}`)}
              </button>
            ))}
          </div>
          <div className="sm:pl-3">
            <Calendar
              language={i18n.language}
              mode="range"
              selected={draft}
              onSelect={setDraft}
              defaultMonth={draft?.from}
              disabled={{ after: today() }}
              numberOfMonths={1}
            />
            <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
              <span className="text-xs text-muted-foreground">
                {tooLong ? t('range.tooLong', { count: maxDays }) : complete ? t('range.days', { count: daysBetween(draft.from!, draft.to!) }) : t('range.pickTwo')}
              </span>
              <button
                type="button"
                disabled={!complete || !!tooLong}
                onClick={() => pick({ from: ymd(draft!.from!), to: ymd(draft!.to!) })}
                className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-background disabled:opacity-40"
              >
                {t('range.apply')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
