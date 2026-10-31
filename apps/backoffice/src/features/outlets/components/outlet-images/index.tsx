import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent, type UniqueIdentifier } from '@dnd-kit/core';
import { arrayMove, rectSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AlertCircle, GripVertical, ImageOff, ImagePlus, RotateCcw, UploadCloud, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Badge, cn, ZoomableImage } from '@wuzz/web-ui';
import { IMAGE_TYPES } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { useImageUploads, type PendingUpload } from '../../hooks/use-image-uploads';
import { isShownImage, MAX_OUTLET_IMAGES } from '../../utils/outlet-form.schema';

const TILE = 'relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-muted';
// Round controls laid over a picture: dark enough to read on any photo, in light and dark mode alike.
const OVERLAY_BUTTON = 'absolute z-10 grid size-8 place-items-center rounded-full bg-black/60 text-white transition-opacity hover:bg-black/80 focus-visible:ring-[3px] focus-visible:ring-ring/60 focus-visible:outline-none';
// On a mouse they show when the tile is hovered or has focus; on a touch screen there is no hover, so they are always there.
const REVEAL = 'opacity-0 group-hover/tile:opacity-100 group-focus-within/tile:opacity-100 pointer-coarse:opacity-100';

/** A stored photo: the picture (opens the viewer), its place, and, on hover or focus, the handle to drag it and the button to remove it. The first is the main photo. */
function Tile({ src, position, all, name, onRemove }: { src: string; position: number; all: { src: string; alt: string }[]; name: string; onRemove: () => void }) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: src });
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={cn(TILE, 'group/tile', isDragging && 'z-20 border-foreground')}>
      <ImageOff className="absolute inset-0 m-auto size-6 text-muted-foreground" aria-hidden />
      {isShownImage(src) && (
        <ZoomableImage
          src={src}
          alt={`${name} ${position + 1}`.trim()}
          images={all}
          index={Math.max(0, all.findIndex((x) => x.src === src))}
          loading="lazy"
          wrapperClassName="absolute inset-0 block h-full w-full rounded-none"
          className="h-full w-full object-cover"
        />
      )}
      {position === 0 && (
        <span className="pointer-events-none absolute top-2 left-2 z-10">
          <Badge tone="info" size="xs">{t('outlets.form.mainPhoto')}</Badge>
        </span>
      )}
      <span className="pointer-events-none absolute bottom-2 left-2 z-10 grid size-6 place-items-center rounded-full bg-black/60 text-[11px] font-semibold text-white tabular-nums">{position + 1}</span>
      <button type="button" onClick={onRemove} aria-label={t('outlets.form.removeImage', { n: position + 1 })} title={t('outlets.form.removeImage', { n: position + 1 })} className={cn(OVERLAY_BUTTON, 'top-2 right-2', REVEAL)}>
        <X className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        ref={setActivatorNodeRef}
        aria-label={t('outlets.form.dragImage', { n: position + 1 })}
        title={t('outlets.form.dragImage', { n: position + 1 })}
        className={cn(OVERLAY_BUTTON, 'right-2 bottom-2 cursor-grab touch-none', REVEAL)}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" aria-hidden />
      </button>
    </li>
  );
}

/** A file on its way up, as a tile: what was picked, dimmed, with a progress ring and cancel; or, if it failed, why, with retry and dismiss. */
function UploadingTile({ item, onRetry, onCancel }: { item: PendingUpload; onRetry: () => void; onCancel: () => void }) {
  const { t } = useTranslation();
  const percent = Math.round(item.progress * 100);
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  return (
    <li className={cn(TILE, item.error && 'border-destructive/60')}>
      <img src={item.preview} alt="" className={cn('absolute inset-0 h-full w-full object-cover', item.error ? 'opacity-30' : 'opacity-50')} />
      {item.error ? (
        <div role="alert" className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-background/85 p-3 text-center">
          <AlertCircle className="size-5 text-destructive" aria-hidden />
          <p className="line-clamp-3 text-xs text-destructive">{item.error}</p>
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={onRetry} className="inline-flex items-center gap-1 rounded-full border border-input bg-card px-3 py-1 text-xs hover:bg-accent" aria-label={t('outlets.form.retryUpload', { name: item.name })}>
              <RotateCcw className="size-3" aria-hidden /> {t('outlets.form.retry')}
            </button>
            <button type="button" onClick={onCancel} className="rounded-full px-3 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground" aria-label={t('outlets.form.dismissUpload', { name: item.name })}>
              {t('outlets.form.dismiss')}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="absolute inset-0 grid place-items-center" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={t('outlets.form.uploading', { name: item.name })}>
            <div className="relative grid size-14 place-items-center rounded-full bg-background/80">
              <svg viewBox="0 0 40 40" className="absolute inset-0 -rotate-90" aria-hidden>
                <circle cx="20" cy="20" r={radius} fill="none" strokeWidth="3" className="stroke-muted" />
                <circle cx="20" cy="20" r={radius} fill="none" strokeWidth="3" strokeLinecap="round" className="stroke-foreground transition-[stroke-dashoffset]" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - item.progress)} />
              </svg>
              <span className="text-[11px] font-semibold tabular-nums">{percent}%</span>
            </div>
          </div>
          <button type="button" onClick={onCancel} aria-label={t('outlets.form.cancelUpload', { name: item.name })} title={t('outlets.form.cancelUpload', { name: item.name })} className={cn(OVERLAY_BUTTON, 'top-2 right-2')}>
            <X className="size-4" aria-hidden />
          </button>
        </>
      )}
    </li>
  );
}

/**
 * The outlet photos: one drop zone (drop files on it or choose them), then the photos as a grid of tiles. A file shows its
 * progress as a tile while it goes up; a stored photo opens the viewer when clicked and is dragged (or moved with the
 * keyboard on its handle) into the order it should show in. The first is the main photo.
 */
export function OutletImages({ value, onChange, error, name = '', onUploadingChange }: { value: string[]; onChange: (images: string[]) => void; error?: string; name?: string; onUploadingChange?: (uploading: boolean) => void }) {
  const { t } = useTranslation();
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const up = useImageUploads(value, onChange);
  useEffect(() => onUploadingChange?.(up.uploading), [up.uploading, onUploadingChange]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const all = value.filter(isShownImage).map((src, i) => ({ src, alt: `${name} ${i + 1}`.trim() }));
  const has = value.length > 0 || up.pending.length > 0;
  const problem = up.notice ?? error;
  const place = (id: UniqueIdentifier) => value.indexOf(String(id)) + 1;
  const onDragEnd = ({ active, over: target }: DragEndEvent) => {
    if (!target || active.id === target.id) return;
    onChange(arrayMove(value, value.indexOf(String(active.id)), value.indexOf(String(target.id))));
  };

  return (
    <div className="space-y-4">
      <div
        role="group"
        aria-label={t('outlets.form.sectionBanner')}
        onDragOver={(e) => {
          if (up.full) return;
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          if (!up.full) up.add([...e.dataTransfer.files]);
        }}
        className={cn(
          'relative flex rounded-2xl border-2 border-dashed transition-colors',
          has ? 'flex-row items-center gap-4 px-5 py-4 text-left' : 'flex-col items-center gap-3 px-6 py-10 text-center',
          over ? 'border-solid border-foreground bg-accent' : 'border-input bg-muted/30',
          problem && !over && 'border-destructive/60',
        )}
      >
        <span className={cn('grid shrink-0 place-items-center rounded-full transition-colors', has ? 'size-10' : 'size-14', over ? 'bg-ink text-background' : 'bg-muted text-muted-foreground')}>
          {has ? <ImagePlus className="size-5" aria-hidden /> : <UploadCloud className="size-7" aria-hidden />}
        </span>
        <div className="min-w-0 flex-1 space-y-1 pr-12">
          <p className="text-sm font-semibold">
            {over ? (
              t('outlets.form.dropOver')
            ) : up.full ? (
              t('outlets.form.limitReached', { max: MAX_OUTLET_IMAGES })
            ) : (
              <>
                {t('outlets.form.dropLead')}{' '}
                <button type="button" onClick={() => input.current?.click()} className="rounded-sm underline decoration-muted-foreground underline-offset-4 hover:decoration-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none">
                  {t('outlets.form.chooseFiles')}
                </button>
              </>
            )}
          </p>
          <p className="text-xs text-muted-foreground">{t('outlets.form.dropRules', { count: value.length, max: MAX_OUTLET_IMAGES })}</p>
        </div>
        <div className="absolute top-3 right-3">
          <Badge tone="muted" size="xs">
            <span aria-hidden>{value.length}/{MAX_OUTLET_IMAGES}</span>
            <span className="sr-only">{t('outlets.form.photoCount', { count: value.length, max: MAX_OUTLET_IMAGES })}</span>
          </Badge>
        </div>
        <input
          ref={input}
          type="file"
          multiple
          accept={IMAGE_TYPES.join(',')}
          className="sr-only"
          tabIndex={-1}
          aria-label={t('outlets.form.chooseFiles')}
          disabled={up.full}
          onChange={(e) => {
            up.add([...(e.target.files ?? [])]);
            e.target.value = '';
          }}
        />
      </div>

      {problem && <p role="alert" className="text-xs whitespace-pre-line text-destructive">{problem}</p>}

      {has && (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
            accessibility={{
              screenReaderInstructions: { draggable: t('outlets.form.sortInstructions') },
              announcements: {
                onDragStart: ({ active }) => t('outlets.form.sortPicked', { n: place(active.id) }),
                onDragOver: ({ active, over: target }) => (target ? t('outlets.form.sortOver', { n: place(active.id), to: place(target.id) }) : undefined),
                onDragEnd: ({ over: target }) => (target ? t('outlets.form.sortDropped', { to: place(target.id) }) : t('outlets.form.sortCancelled')),
                onDragCancel: () => t('outlets.form.sortCancelled'),
              },
            }}
          >
            <SortableContext items={value} strategy={rectSortingStrategy}>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {value.map((src, i) => (
                  <Tile key={src} src={src} position={i} all={all} name={name} onRemove={() => onChange(value.filter((x) => x !== src))} />
                ))}
                {up.pending.map((p) => (
                  <UploadingTile key={p.id} item={p} onRetry={() => up.retry(p.id)} onCancel={() => up.cancel(p.id)} />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
          {value.length >= 2 && <p className="text-xs text-muted-foreground">{t('outlets.form.reorderHint')}</p>}
        </>
      )}
    </div>
  );
}
