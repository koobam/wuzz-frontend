import { ChevronDown, Clock } from 'lucide-react';
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Input } from '../../atoms/input';
import { cn } from '../../utils/cn';
import { usePortalTarget } from '../../utils/portal-target';
import { formatTime, parseTime, splitTime } from '../../utils/time';

const POPOVER_WIDTH = 264;
/** Header (24) + five rows (180) + presets (44) + padding and border (24): used to decide whether it fits below the field. */
const POPOVER_HEIGHT = 276;
/** A row of a wheel, and how many show at once: the chosen row is always the 3rd, centred, with two rows of room either side. */
const ROW = 36;
const VISIBLE = 5;
const PAD = ROW * ((VISIBLE - 1) / 2);

type Column = 'hour' | 'minute';

/**
 * A time of day ("HH:MM", 24 hours) as a field: it looks like a text box (same shape and height as `Input`), can be typed
 * into (`0830`, `8:30`), and opens a popover with two wheels, hours and minutes (a step of `minuteStep`), whose chosen row
 * always sits on the same centre band, and optional quick `presets`. Scrolling a wheel (or clicking a row) chooses. The
 * popover is drawn in the page, or in the modal it is used in, below the field and above it only when there is no room. Keyboard: Arrow Down opens it; Up/Down change the active column, Left/Right switch columns, Enter
 * confirms and Escape closes. `disabled` makes it unselectable (and says why in `disabledHint`).
 */
export function TimePicker({
  value,
  onChange,
  onBlur,
  id,
  name,
  disabled = false,
  disabledHint,
  invalid = false,
  minuteStep = 5,
  presets,
  placeholder = '--:--',
  ariaLabel,
  hourLabel = 'Hour',
  minuteLabel = 'Minute',
  popoverLabel,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  id?: string;
  name?: string;
  disabled?: boolean;
  disabledHint?: string;
  invalid?: boolean;
  minuteStep?: number;
  presets?: string[];
  placeholder?: string;
  ariaLabel?: string;
  hourLabel?: string;
  minuteLabel?: string;
  popoverLabel?: string;
  className?: string;
}) {
  const popId = useId();
  const portalTarget = usePortalTarget();
  const wrap = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  const lists = useRef<Record<Column, HTMLDivElement | null>>({ hour: null, minute: null });
  // True while the wheels are being moved by code, so their scroll events are not read as a person choosing.
  const moving = useRef(false);
  const settle = useRef<Partial<Record<Column, ReturnType<typeof setTimeout>>>>({});
  const [open, setOpen] = useState(false);
  const [draft, setDraftState] = useState<string | null>(null);
  // The draft is also kept in a ref, so closing can read it without a state updater (which must not call `onChange`).
  const draftRef = useRef<string | null>(null);
  const setDraft = useCallback((d: string | null) => {
    draftRef.current = d;
    setDraftState(d);
  }, []);
  const [active, setActive] = useState<Column>('hour');
  const [pos, setPos] = useState<{ left: number; top?: number; bottom?: number } | null>(null);

  const current = splitTime(value);
  const minutes = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => i * minuteStep);
  // A minute that is not on the step (08:07, from the server or typed) still has to show and be selected.
  if (current && !minutes.includes(current.minute)) minutes.push(current.minute), minutes.sort((a, b) => a - b);

  const place = useCallback(() => {
    const el = wrap.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const left = Math.min(Math.max(8, r.left), Math.max(8, window.innerWidth - POPOVER_WIDTH - 8));
    const below = window.innerHeight - r.bottom;
    setPos(below >= POPOVER_HEIGHT + 12 || below >= r.top ? { left, top: r.bottom + 6 } : { left, bottom: window.innerHeight - r.top + 6 });
  }, []);

  const commit = useCallback(
    (text: string | null) => {
      if (text === null) return;
      const parsed = parseTime(text);
      if (parsed) onChange(parsed);
      setDraft(null);
    },
    [onChange, setDraft],
  );

  const close = useCallback(
    (refocus = false) => {
      setOpen(false);
      const typed = draftRef.current;
      if (typed !== null) {
        const parsed = parseTime(typed);
        if (parsed) onChange(parsed);
      }
      setDraft(null);
      if (refocus) input.current?.focus();
    },
    [onChange, setDraft],
  );

  const show = () => {
    if (disabled) return;
    place();
    setActive('hour');
    setOpen(true);
  };

  // Puts the chosen hour and minute on the centre band (08:00 when nothing is chosen yet).
  const latest = useRef({ current, minutes });
  latest.current = { current, minutes };
  const centre = useCallback((smooth: boolean) => {
    const { current: c, minutes: m } = latest.current;
    const at = c ?? { hour: 8, minute: 0 };
    moving.current = true;
    const behavior = smooth ? 'smooth' : 'auto';
    lists.current.hour?.scrollTo({ top: at.hour * ROW, behavior });
    lists.current.minute?.scrollTo({ top: Math.max(m.indexOf(at.minute), 0) * ROW, behavior });
    window.setTimeout(() => (moving.current = false), smooth ? 420 : 60);
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    place();
    centre(false);
  }, [open, place, centre]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!wrap.current?.contains(t) && !pop.current?.contains(t)) close();
    };
    const move = () => place();
    document.addEventListener('pointerdown', onDown);
    window.addEventListener('resize', move);
    window.addEventListener('scroll', move, true);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      window.removeEventListener('resize', move);
      window.removeEventListener('scroll', move, true);
    };
  }, [open, close, place]);

  // Re-centre the wheels when the value moves (keyboard steps, typing, a preset).
  useEffect(() => {
    if (open) centre(true);
  }, [open, value, centre]);

  // A wheel that has stopped moving chooses the row on the centre band.
  const onWheelScroll = (col: Column) => () => {
    if (moving.current) return;
    clearTimeout(settle.current[col]);
    settle.current[col] = setTimeout(() => {
      const el = lists.current[col];
      if (!el || moving.current) return;
      const idx = Math.round(el.scrollTop / ROW);
      const { current: c, minutes: m } = latest.current;
      const at = c ?? { hour: 8, minute: 0 };
      if (col === 'hour') {
        const h = Math.min(Math.max(idx, 0), 23);
        if (h !== at.hour || !c) {
          setDraft(null);
          onChange(formatTime(h, at.minute));
        }
      } else {
        const min = m[Math.min(Math.max(idx, 0), m.length - 1)]!;
        if (min !== at.minute || !c) {
          setDraft(null);
          onChange(formatTime(at.hour, min));
        }
      }
    }, 140);
  };

  const set = (hour: number, minute: number) => onChange(formatTime(hour, minute));
  const step = (dir: 1 | -1) => {
    const base = current ?? { hour: 8, minute: 0 };
    if (active === 'hour') set((base.hour + dir + 24) % 24, base.minute);
    else {
      const i = minutes.indexOf(base.minute);
      const next = minutes[(Math.max(i, 0) + dir + minutes.length) % minutes.length]!;
      set(base.hour, next);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) return show();
      setDraft(null);
      step(e.key === 'ArrowDown' ? 1 : -1);
    } else if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && open && draft === null) {
      e.preventDefault();
      setActive(e.key === 'ArrowLeft' ? 'hour' : 'minute');
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (open || draft !== null) close();
      else show();
    } else if (e.key === 'Escape' && open) {
      e.preventDefault();
      e.stopPropagation();
      setDraft(null);
      setOpen(false);
    }
  };

  const base = current ?? { hour: 8, minute: 0 };
  const optionClass = (on: boolean) =>
    cn(
      'block h-9 w-full snap-center rounded-xl text-center text-sm tabular-nums transition-colors focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none',
      on ? 'font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground',
    );

  return (
    <div ref={wrap} className={cn('relative', className)} title={disabled ? disabledHint : undefined}>
      <Clock className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <Input
        ref={input}
        id={id}
        name={name}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        role="combobox"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? popId : undefined}
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        invalid={invalid}
        maxLength={5}
        placeholder={placeholder}
        value={draft ?? value}
        onFocus={(e) => e.currentTarget.select()}
        onClick={() => (open ? undefined : show())}
        onChange={(e) => setDraft(e.target.value.replace(/[^\d:.\s]/g, ''))}
        onKeyDown={onKeyDown}
        onBlur={() => {
          commit(draft);
          onBlur?.();
        }}
        className={cn(
          'pr-10 pl-10 tabular-nums',
          disabled && 'cursor-not-allowed bg-[repeating-linear-gradient(135deg,transparent_0_6px,var(--color-muted)_6px_7px)] text-muted-foreground',
        )}
      />
      <ChevronDown className={cn('pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-foreground transition-transform', open && 'rotate-180')} aria-hidden />

      {open &&
        pos &&
        createPortal(
          <div
            ref={pop}
            id={popId}
            role="dialog"
            aria-label={popoverLabel ?? ariaLabel ?? hourLabel}
            // Keeps the focus in the text box, so typing and the arrow keys carry on while the mouse picks.
            onMouseDown={(e) => e.preventDefault()}
            className="fixed z-[70] rounded-2xl border border-border bg-card p-3 text-foreground"
            style={{ left: pos.left, top: pos.top, bottom: pos.bottom, width: POPOVER_WIDTH }}
          >
            <div className="grid grid-cols-2 gap-2 pb-1">
              {(['hour', 'minute'] as const).map((col) => (
                <p key={col} className={cn('text-center text-[11px] font-medium', active === col ? 'text-foreground' : 'text-muted-foreground')}>
                  {col === 'hour' ? hourLabel : minuteLabel}
                  <span className={cn('mx-auto mt-0.5 block h-0.5 w-5 rounded-full transition-colors', active === col ? 'bg-foreground' : 'bg-transparent')} aria-hidden />
                </p>
              ))}
            </div>
            <div className="relative" style={{ height: ROW * VISIBLE }}>
              {/* One band behind the middle row of both wheels: whatever sits on it is the chosen time. */}
              <div className="pointer-events-none absolute inset-x-0 rounded-xl bg-accent" style={{ top: PAD, height: ROW }} aria-hidden />
              <div className="relative grid h-full grid-cols-2 gap-2">
                {(['hour', 'minute'] as const).map((col) => (
                  <div
                    key={col}
                    ref={(el) => {
                      lists.current[col] = el;
                    }}
                    role="listbox"
                    aria-label={col === 'hour' ? hourLabel : minuteLabel}
                    onScroll={onWheelScroll(col)}
                    onPointerDown={() => setActive(col)}
                    className="h-full snap-y snap-mandatory overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    style={{ paddingTop: PAD, paddingBottom: PAD }}
                  >
                    {(col === 'hour' ? Array.from({ length: 24 }, (_, i) => i) : minutes).map((n) => {
                      const on = current !== null && (col === 'hour' ? current.hour === n : current.minute === n);
                      return (
                        <button
                          key={n}
                          type="button"
                          role="option"
                          aria-selected={on}
                          tabIndex={-1}
                          onClick={() => {
                            setDraft(null);
                            if (col === 'hour') {
                              set(n, base.minute);
                              setActive('minute');
                            } else {
                              set(base.hour, n);
                              close(true);
                            }
                          }}
                          className={optionClass(on)}
                        >
                          {String(n).padStart(2, '0')}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-card via-card/70 to-transparent" aria-hidden />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card via-card/70 to-transparent" aria-hidden />
            </div>
            {presets && presets.length > 0 && (
              <div className="mt-2 flex flex-nowrap gap-1.5 overflow-x-auto border-t border-border pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {presets.map((p) => (
                  <button
                    key={p}
                    type="button"
                    tabIndex={-1}
                    onClick={() => {
                      setDraft(null);
                      onChange(p);
                      close(true);
                    }}
                    className={cn('shrink-0 rounded-full border border-input px-2 py-1 text-xs tabular-nums transition-colors hover:bg-accent', p === value && 'border-foreground bg-accent font-medium')}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>,
          portalTarget ?? document.body,
        )}
    </div>
  );
}
