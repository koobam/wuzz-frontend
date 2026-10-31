import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { useTranslation } from '@/core/utils/i18n';
import type { OrderStats } from '@/core/api';

// Cancelled orders are drawn hatched, as in the design; the stripes are plain CSS.
const HATCH = 'repeating-linear-gradient(135deg, #e2483d 0 2px, #f6c3bf 2px 5px)';

type Series = 'fulfilled' | 'cancelled' | 'open';
const SERIES: Series[] = ['fulfilled', 'cancelled', 'open'];
const SWATCH: Record<Series, React.CSSProperties> = {
  fulfilled: { backgroundImage: 'var(--ink-gradient)' },
  cancelled: { backgroundImage: HATCH },
  open: { backgroundColor: 'var(--border)' },
};

const TOOLTIP_W = 11; // rem

/** The next "round" number at or above n, for the top of the y axis. */
function niceMax(n: number): number {
  if (n <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(n));
  return Math.ceil(n / pow) * pow;
}

/**
 * Stacked bars per day: fulfilled (dark), cancelled (hatched), the rest still open (grey).
 *
 * One pointer layer over the whole plot (not a hover target per bar), so the highlighted column and the
 * tooltip slide from day to day instead of blinking through the gaps. Arrow keys do the same from the
 * keyboard. Click a legend entry to hide or show that series; the bars and the axis ease to the new size.
 */
export function OrdersChart({ days }: { days: OrderStats['days'] }) {
  const { t, i18n } = useTranslation();
  const plot = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  // Kept after the pointer leaves, so the tooltip fades out where it was instead of jumping to the start.
  const [last, setLast] = useState(0);
  const [hidden, setHidden] = useState<Set<Series>>(new Set());

  const rows = days.map((d) => ({ ...d, open: Math.max(0, d.orders - d.fulfilled - d.cancelled) }));
  const n = rows.length;
  const value = (r: (typeof rows)[number], s: Series) => (hidden.has(s) ? 0 : r[s]);
  const max = niceMax(Math.max(0, ...rows.map((r) => SERIES.reduce((sum, s) => sum + value(r, s), 0))));
  const ticks = [1, 0.75, 0.5, 0.25, 0].map((f) => Math.round(max * f));
  const pct = (v: number) => `${(v / max) * 100}%`;

  const many = n > 10;
  const label = (date: string, long = false) =>
    new Date(`${date}T00:00:00`).toLocaleDateString(
      i18n.language,
      long ? { weekday: 'long', day: 'numeric', month: 'long' } : many ? { day: 'numeric', month: 'short' } : { weekday: 'short' },
    );
  const step = many ? Math.ceil(n / 6) : 1; // a label under every bar for a week, about every fifth for a month

  const focus = (i: number) => {
    const clamped = Math.min(n - 1, Math.max(0, i));
    setActive(clamped);
    setLast(clamped);
  };
  const onMove = (e: PointerEvent) => {
    const box = plot.current?.getBoundingClientRect();
    if (!box || n === 0) return;
    focus(Math.floor(((e.clientX - box.left) / box.width) * n));
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') focus((active ?? n) - 1);
    else if (e.key === 'ArrowRight') focus((active ?? -1) + 1);
    else if (e.key === 'Escape') setActive(null);
    else return;
    e.preventDefault();
  };
  const toggle = (s: Series) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });

  const shown = rows[last];
  const visible = active !== null;
  const ease = 'transition-[height] duration-500 ease-out motion-reduce:transition-none';

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-medium">{t('dashboard.chart.title')}</span>
        <span className="flex items-center gap-1 text-muted-foreground">
          {SERIES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggle(s)}
              aria-pressed={!hidden.has(s)}
              title={t('dashboard.chart.toggle')}
              className={`flex items-center gap-1.5 rounded-full px-2 py-1 transition-[opacity,background-color] duration-200 hover:bg-accent ${hidden.has(s) ? 'opacity-40' : ''}`}
            >
              <span className="size-2.5 rounded-sm" style={SWATCH[s]} />
              <span className={hidden.has(s) ? 'line-through' : ''}>{t(`dashboard.chart.${s}`)}</span>
            </button>
          ))}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 gap-2">
        {/* pb-6 keeps the numbers level with the plot, not with the day labels under it */}
        <div className="flex flex-col justify-between pb-6 text-right text-[10px] text-muted-foreground">
          {ticks.map((v, i) => (
            <span key={i}>{v}</span>
          ))}
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div
            ref={plot}
            tabIndex={0}
            role="group"
            aria-label={t('dashboard.chart.title')}
            onPointerMove={onMove}
            onPointerDown={onMove}
            onPointerLeave={() => setActive(null)}
            onKeyDown={onKey}
            onBlur={() => setActive(null)}
            className="relative min-h-44 flex-1 touch-pan-y rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="absolute inset-0 flex flex-col justify-between" aria-hidden>
              {ticks.map((_, i) => (
                <div key={i} className="border-t border-dashed border-border" />
              ))}
            </div>

            {n > 0 && (
              // The highlighted column: one element that slides, not one per bar.
              <div
                aria-hidden
                className={`absolute inset-y-0 rounded-lg bg-foreground/[0.06] transition-[left,opacity] duration-150 ease-out motion-reduce:transition-none ${visible ? 'opacity-100' : 'opacity-0'}`}
                style={{ left: `${(last / n) * 100}%`, width: `${100 / n}%` }}
              />
            )}

            <div className="absolute inset-0 flex items-end">
              {rows.map((r, i) => (
                <div key={r.date} className="flex h-full min-w-0 flex-1 items-end justify-center px-[2px]">
                  <div
                    className="flex h-full w-full origin-bottom flex-col justify-end overflow-hidden rounded-md motion-safe:animate-[bar-grow_600ms_cubic-bezier(0.22,1,0.36,1)_both]"
                    style={{ animationDelay: `${Math.min(i, 30) * 14}ms` }}
                  >
                    <div className={`bg-border ${ease}`} style={{ height: pct(value(r, 'open')) }} />
                    <div className={ease} style={{ height: pct(value(r, 'cancelled')), backgroundImage: HATCH }} />
                    <div className={`bg-ink ${ease}`} style={{ height: pct(value(r, 'fulfilled')) }} />
                  </div>
                </div>
              ))}
            </div>

            {shown && (
              <div
                role="status"
                aria-live="polite"
                className={`pointer-events-none absolute top-1 z-20 rounded-2xl border border-border bg-card p-3 text-xs transition-[left,opacity,transform] duration-150 ease-out motion-reduce:transition-none ${
                  visible ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
                }`}
                style={{
                  width: `${TOOLTIP_W}rem`,
                  // Centred over the column, kept inside the plot at either end.
                  left: `clamp(0px, calc(${((last + 0.5) / n) * 100}% - ${TOOLTIP_W / 2}rem), calc(100% - ${TOOLTIP_W}rem))`,
                }}
              >
                <div className="mb-1.5 font-medium">{label(shown.date, true)}</div>
                {SERIES.map((s) => (
                  <div key={s} className="flex items-center justify-between gap-2 py-0.5">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="size-2.5 rounded-sm" style={SWATCH[s]} />
                      {t(`dashboard.chart.${s}`)}
                    </span>
                    <span className="font-medium tabular-nums">{shown[s]}</span>
                  </div>
                ))}
                <div className="mt-1 flex justify-between border-t border-border pt-1.5 font-medium">
                  <span>{t('dashboard.chart.total')}</span>
                  <span className="tabular-nums">{shown.orders}</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-2 flex h-4 shrink-0 text-center text-[10px] text-muted-foreground">
            {rows.map((r, i) => (
              <span key={r.date} className={`min-w-0 flex-1 whitespace-nowrap transition-colors duration-150 ${active === i ? 'text-foreground' : ''}`}>
                {i % step === 0 || active === i ? label(r.date) : ''}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
