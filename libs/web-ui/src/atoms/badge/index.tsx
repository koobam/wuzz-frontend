import { Check, Copy } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

/**
 * A pill: a status, a count, the environment. `tone` is its colour and `size` its text. With `help`, hovering or focusing it explains what the status means. The explanation is drawn in a
 * portal at a fixed position (above the pill, or below it near the top of the screen), so a table that scrolls
 * or clips its content cannot cut it off.
 */
export type BadgeTone = 'muted' | 'good' | 'bad' | 'warn' | 'info';
export type BadgeSize = 'sm' | 'xs' | '2xs';

// Solid fills with white text: calm, never a glowing pastel. `xs` and `2xs` are the small capital labels (an environment, a count).
const TONES: Record<BadgeTone, string> = {
  muted: 'bg-neutral-500 text-white dark:bg-neutral-600',
  good: 'bg-emerald-700 text-white dark:bg-emerald-600',
  bad: 'bg-red-700 text-white dark:bg-red-600',
  warn: 'bg-amber-600 text-white dark:bg-amber-600',
  info: 'bg-sky-700 text-white dark:bg-sky-600',
};
const SIZES: Record<BadgeSize, string> = {
  sm: 'px-2.5 py-0.5 text-xs',
  xs: 'px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase',
  '2xs': 'px-1.5 py-px text-[8px] leading-3 font-semibold tracking-wide uppercase',
};

export function Badge({
  children,
  tone = 'muted',
  size = 'sm',
  help,
  copy,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  size?: BadgeSize;
  help?: string;
  /** A text the pill copies to the clipboard when clicked (an order code): it becomes a button, in monospace, and says so for a moment after. */
  copy?: string;
}) {
  const id = useId();
  const [at, setAt] = useState<{ x: number; top: number; bottom: number } | null>(null);
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const look = `inline-flex items-center rounded-full whitespace-nowrap ${SIZES[size]} ${TONES[tone]}`;
  const doCopy = () => {
    void navigator.clipboard?.writeText(copy!).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  };
  if (copy !== undefined)
    return (
      <button
        type="button"
        onClick={doCopy}
        title={t('common.copy')}
        aria-label={`${copy}: ${t('common.copy')}`}
        className={`${look} cursor-pointer gap-1.5 font-mono tracking-tight outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring`}
      >
        {children}
        {copied ? <Check className="size-3" aria-hidden /> : <Copy className="size-3 opacity-70" aria-hidden />}
        <span className="sr-only" role="status">{copied ? t('common.copied') : ''}</span>
      </button>
    );
  const pill = <span className={`${look} ${help ? 'cursor-help' : ''}`}>{children}</span>;
  if (!help) return pill;

  const show = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    setAt({ x: r.left + r.width / 2, top: r.top, bottom: r.bottom });
  };
  const below = at !== null && at.top < 96;
  return (
    <span
      tabIndex={0}
      aria-describedby={at ? id : undefined}
      className="inline-flex rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
      onMouseEnter={(e) => show(e.currentTarget)}
      onMouseLeave={() => setAt(null)}
      onFocus={(e) => show(e.currentTarget)}
      onBlur={() => setAt(null)}
    >
      {pill}
      {at &&
        createPortal(
          <span
            id={id}
            role="tooltip"
            className="pointer-events-none fixed z-[60] w-56 rounded-xl border border-border bg-card px-3 py-2 text-xs leading-snug font-normal text-foreground"
            style={{
              left: Math.min(Math.max(at.x, 128), window.innerWidth - 128),
              top: below ? at.bottom + 8 : at.top - 8,
              transform: below ? 'translateX(-50%)' : 'translate(-50%, -100%)',
            }}
          >
            {help}
          </span>,
          document.body,
        )}
    </span>
  );
}
