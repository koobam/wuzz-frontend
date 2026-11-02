/**
 * The outlet pin, drawn like Reddog's map pin but flat (no shadow): a round head with a white border and a white dot in it,
 * a thin dark stem, and a small dark dot on the ground. The ground dot's centre is the exact coordinate (the map puts the
 * marker's bottom edge `groundOffset` below the point), the head and stem lift a few pixels while the pin is held or pointed at,
 * and a picker can show a bubble that bobs above the head until the pin has been moved once. It is a focusable button, so a
 * keyboard reaches it and a screen reader has its name.
 */
type Size = { head: number; stem: number; dot: number; inner: number };
const SIZES = { md: { head: 40, stem: 24, dot: 12, inner: 12 }, sm: { head: 26, stem: 12, dot: 8, inner: 8 } } satisfies Record<string, Size>;
const INK = '#111111';
const OFF_WHITE = '#FFFFFF';
const LIFT = 6;
/** The customer app's secondary colour: the head of its location-picker pin (and Reddog's). */
export const PIN_PICKER = '#FF9500';

let styled = false;
function ensureStyle() {
  if (styled) return;
  styled = true;
  const style = document.createElement('style');
  style.textContent = '@keyframes outlet-pin-bob{0%,100%{translate:0 0}50%{translate:0 -6px}}@media (prefers-reduced-motion:reduce){.outlet-pin-bubble{animation:none!important}}';
  document.head.append(style);
}

export type Pin = {
  element: HTMLButtonElement;
  /** Lifts the head off the ground (held, pointed at). */
  lift: (on: boolean) => void;
  /** Takes the bubble away for good (the pin has been moved). */
  dismissHint: () => void;
  /** Height of the whole pin, and how far below the coordinate the marker's bottom edge sits (pass it as the marker's `offset`). */
  height: number;
  groundOffset: number;
};

export function createPin({ label, color = PIN_PICKER, size = 'md', hint, cursor = 'pointer', decorative = false }: { label: string; color?: string; size?: keyof typeof SIZES; hint?: string; cursor?: string; /** Not a control: no name, not focusable, ignores the pointer (the fixed pin over a picker map). */ decorative?: boolean }): Pin {
  ensureStyle();
  const s = SIZES[size];
  const height = s.head + s.stem + s.dot;

  const el = document.createElement('button');
  el.type = 'button';
  if (decorative) {
    el.tabIndex = -1;
    el.setAttribute('aria-hidden', 'true');
  } else el.setAttribute('aria-label', label);
  el.style.cssText = `${decorative ? 'pointer-events:none;' : ''}display:block;width:${s.head}px;height:${height}px;padding:0;border:0;background:none;cursor:${cursor};outline-offset:4px`;

  // Head and stem move together; the ground dot stays put.
  const body = document.createElement('span');
  body.style.cssText = `position:absolute;left:0;right:0;bottom:${s.dot}px;display:flex;flex-direction:column;align-items:center;transition:transform .15s ease-out`;
  const head = document.createElement('span');
  head.style.cssText = `display:grid;place-items:center;width:${s.head}px;height:${s.head}px;border-radius:9999px;border:${size === 'md' ? 4 : 3}px solid ${OFF_WHITE};box-sizing:border-box;background:${color}`;
  const inner = document.createElement('span');
  inner.style.cssText = `width:${s.inner}px;height:${s.inner}px;border-radius:9999px;background:#fff`;
  head.append(inner);
  const stem = document.createElement('span');
  stem.style.cssText = `width:2px;height:${s.stem}px;background:${INK}`;
  body.append(head, stem);

  const ground = document.createElement('span');
  ground.style.cssText = `position:absolute;left:50%;bottom:0;width:${s.dot}px;height:${s.dot}px;margin-left:-${s.dot / 2}px;border-radius:9999px;border:2px solid ${OFF_WHITE};box-sizing:border-box;background:${INK}`;

  let bubble: HTMLSpanElement | undefined;
  if (hint) {
    bubble = document.createElement('span');
    bubble.className = 'outlet-pin-bubble';
    bubble.setAttribute('aria-hidden', 'true');
    bubble.style.cssText = 'position:absolute;bottom:100%;left:50%;margin-bottom:6px;transform:translateX(-50%);white-space:nowrap;padding:6px 12px;border-radius:12px;border:2px solid #fff;background:rgba(20,20,22,.95);color:#fff;font:500 12px/1.2 system-ui,sans-serif;pointer-events:none;animation:outlet-pin-bob 1.3s ease-in-out infinite';
    bubble.textContent = hint;
    body.append(bubble);
  }

  let lifted = false;
  const apply = (hover: boolean) => (body.style.transform = lifted || hover ? `translateY(-${LIFT}px)` : '');
  el.addEventListener('mouseenter', () => apply(true));
  el.addEventListener('mouseleave', () => apply(false));
  el.append(body, ground);

  return {
    element: el,
    lift: (on) => {
      lifted = on;
      apply(false);
    },
    dismissHint: () => bubble?.remove(),
    height,
    groundOffset: s.dot / 2,
  };
}
