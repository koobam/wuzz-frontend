import { ChevronLeft, ChevronRight, ImageOff, Loader2, Maximize, X, ZoomIn, ZoomOut } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { useTranslation } from 'react-i18next';

export type ViewerImage = { src: string; alt?: string };

const MIN = 1;
const MAX = 6;
const STEP = 1.25;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

const BTN = 'grid size-10 place-items-center rounded-full border border-white/20 bg-black/50 text-white transition-colors hover:bg-white/20 focus-visible:ring-[3px] focus-visible:ring-white/50 focus-visible:outline-none disabled:opacity-30';

/**
 * A picture full-screen, to look at closely. It is the browser's own modal `<dialog>` (focus stays inside, Escape and a click on
 * the dark backdrop close it, and focus goes back to what opened it). Zoom with the buttons, `+` / `-` / `0`, the wheel, a pinch
 * or a double click (1x to 6x); drag to move around once zoomed. With several pictures the arrows (and ArrowLeft / ArrowRight)
 * go to the others and a counter says where you are.
 */
export function ImageViewer({ open, images, index, onIndexChange, onClose }: { open: boolean; images: ViewerImage[]; index: number; onIndexChange?: (i: number) => void; onClose: () => void }) {
  const { t } = useTranslation();
  const dialog = useRef<HTMLDialogElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [status, setStatus] = useState<'loading' | 'ready' | 'broken'>('loading');
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ distance: number; scale: number } | null>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  // A drag that ends over the empty stage is not a click on the backdrop.
  const moved = useRef(false);

  const current = images[clamp(index, 0, Math.max(images.length - 1, 0))];
  const many = images.length > 1;

  // How far the picture may be moved: only as far as its edge reaches the edge of what is shown.
  const bound = useCallback((o: { x: number; y: number }, s: number) => {
    const w = img.current?.clientWidth ?? 0;
    const h = img.current?.clientHeight ?? 0;
    const mx = Math.max(0, (w * s - (stage.current?.clientWidth ?? w)) / 2);
    const my = Math.max(0, (h * s - (stage.current?.clientHeight ?? h)) / 2);
    return { x: clamp(o.x, -mx, mx), y: clamp(o.y, -my, my) };
  }, []);

  const zoomTo = useCallback(
    (next: number) => {
      const s = clamp(next, MIN, MAX);
      setScale(s);
      setOffset((o) => (s === 1 ? { x: 0, y: 0 } : bound(o, s)));
    },
    [bound],
  );
  const reset = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);
  const go = useCallback(
    (to: number) => {
      if (!many) return;
      onIndexChange?.((to + images.length) % images.length);
    },
    [many, images.length, onIndexChange],
  );

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  // A new picture starts unzoomed.
  useEffect(() => {
    reset();
    setStatus('loading');
  }, [current?.src, open, reset]);

  // The wheel zooms; it has to be a non-passive listener to stop the page behind from scrolling.
  useEffect(() => {
    const el = stage.current;
    if (!el || !open) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setScale((s) => {
        const next = clamp(s * (e.deltaY < 0 ? STEP : 1 / STEP), MIN, MAX);
        setOffset((o) => (next === 1 ? { x: 0, y: 0 } : bound(o, next)));
        return next;
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [open, bound]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === '+' || e.key === '=') zoomTo(scale * STEP);
    else if (e.key === '-' || e.key === '_') zoomTo(scale / STEP);
    else if (e.key === '0') reset();
    else if (e.key === 'ArrowRight' && scale === 1) go(index + 1);
    else if (e.key === 'ArrowLeft' && scale === 1) go(index - 1);
    else return;
    e.preventDefault();
  };

  const onPointerDown = (e: ReactPointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved.current = false;
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current = { distance: Math.hypot(a!.x - b!.x, a!.y - b!.y), scale };
      drag.current = null;
    } else {
      drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
    }
  };
  const onPointerMove = (e: ReactPointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2 && gesture.current) {
      const [a, b] = [...pointers.current.values()];
      zoomTo(gesture.current.scale * (Math.hypot(a!.x - b!.x, a!.y - b!.y) / gesture.current.distance));
    } else if (drag.current && scale > 1) {
      if (Math.hypot(e.clientX - drag.current.x, e.clientY - drag.current.y) > 4) moved.current = true;
      setOffset(bound({ x: drag.current.ox + e.clientX - drag.current.x, y: drag.current.oy + e.clientY - drag.current.y }, scale));
    }
  };
  const onPointerUp = (e: ReactPointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) gesture.current = null;
    if (pointers.current.size === 0) drag.current = null;
  };

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === dialog.current) onClose();
      }}
      onKeyDown={onKeyDown}
      aria-label={current?.alt || t('viewer.title')}
      className="m-0 h-dvh max-h-none w-dvw max-w-none overflow-hidden border-0 bg-transparent p-0 text-white backdrop:bg-black/90"
    >
      {open && current && (
        <div className="relative flex h-full w-full flex-col">
          <div className="flex shrink-0 items-center justify-between gap-3 p-3 sm:p-4">
            <span className="rounded-full bg-black/50 px-3 py-1 text-xs tabular-nums" aria-live="polite">
              {many ? t('viewer.counter', { index: index + 1, total: images.length }) : `${Math.round(scale * 100)}%`}
              {many && scale > 1 ? ` · ${Math.round(scale * 100)}%` : ''}
            </span>
            <div className="flex items-center gap-2">
              <button type="button" className={BTN} onClick={() => zoomTo(scale / STEP)} disabled={scale <= MIN} aria-label={t('viewer.zoomOut')} title={t('viewer.zoomOut')}>
                <ZoomOut className="size-5" aria-hidden />
              </button>
              <button type="button" className={BTN} onClick={() => zoomTo(scale * STEP)} disabled={scale >= MAX} aria-label={t('viewer.zoomIn')} title={t('viewer.zoomIn')}>
                <ZoomIn className="size-5" aria-hidden />
              </button>
              <button type="button" className={BTN} onClick={reset} disabled={scale === 1} aria-label={t('viewer.reset')} title={t('viewer.reset')}>
                <Maximize className="size-5" aria-hidden />
              </button>
              <button type="button" className={BTN} onClick={onClose} aria-label={t('viewer.close')} title={t('viewer.close')} autoFocus>
                <X className="size-5" aria-hidden />
              </button>
            </div>
          </div>

          <div
            ref={stage}
            className="relative min-h-0 flex-1 touch-none select-none"
            style={{ cursor: scale > 1 ? 'grab' : 'zoom-in' }}
            onClick={(e) => e.target === stage.current && !moved.current && scale === 1 && onClose()}
            onDoubleClick={() => (scale > 1 ? reset() : zoomTo(2.5))}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <div className="absolute inset-0 grid place-items-center p-2 sm:p-6">
              {status === 'loading' && <Loader2 className="absolute size-8 animate-spin text-white/70" aria-label={t('viewer.loading')} />}
              {status === 'broken' ? (
                <div className="grid place-items-center gap-2 text-center text-sm text-white/80">
                  <ImageOff className="size-10" aria-hidden />
                  {t('viewer.broken')}
                </div>
              ) : (
                <img
                  key={current.src}
                  ref={img}
                  src={current.src}
                  alt={current.alt ?? ''}
                  draggable={false}
                  onLoad={() => setStatus('ready')}
                  onError={() => setStatus('broken')}
                  className="max-h-full max-w-full rounded-lg object-contain"
                  style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`, transition: drag.current || gesture.current ? 'none' : 'transform 120ms ease-out', opacity: status === 'ready' ? 1 : 0 }}
                />
              )}
            </div>
            {many && (
              <>
                <button type="button" className={`${BTN} absolute top-1/2 left-3 -translate-y-1/2`} onClick={() => go(index - 1)} aria-label={t('viewer.previous')} title={t('viewer.previous')}>
                  <ChevronLeft className="size-5" aria-hidden />
                </button>
                <button type="button" className={`${BTN} absolute top-1/2 right-3 -translate-y-1/2`} onClick={() => go(index + 1)} aria-label={t('viewer.next')} title={t('viewer.next')}>
                  <ChevronRight className="size-5" aria-hidden />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}
