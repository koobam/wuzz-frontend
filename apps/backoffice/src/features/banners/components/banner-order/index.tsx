import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent, type UniqueIdentifier } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowDown, ArrowUp, GripVertical } from 'lucide-react';
import { Badge, cn } from '@wuzz/web-ui';
import type { Banner } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { liveState, LIVE_TONE } from '../../utils/banner-display';
import { BannerThumb } from '../banner-thumb';

const ICON_BUTTON = 'grid size-9 shrink-0 place-items-center rounded-full border border-transparent text-muted-foreground outline-none transition-colors hover:border-input hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-40';

function Row({ banner, position, total, onUp, onDown }: { banner: Banner; position: number; total: number; onUp: () => void; onDown: () => void }) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: banner.id });
  const state = liveState(banner);
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('flex items-center gap-3 rounded-2xl border border-border bg-card p-3', isDragging && 'relative z-20 border-foreground')}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        aria-label={t('banners.order.drag', { name: banner.title })}
        title={t('banners.order.drag', { name: banner.title })}
        className={cn(ICON_BUTTON, 'cursor-grab touch-none')}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" aria-hidden />
      </button>
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold tabular-nums">{position + 1}</span>
      <BannerThumb banner={banner} className="w-24 sm:w-36" />
      <span className="min-w-0 flex-1 space-y-1">
        <span className="block truncate text-sm font-medium">{banner.title}</span>
        <span className="flex flex-wrap items-center gap-1.5">
          <Badge tone={banner.status === 'active' ? 'good' : 'warn'} size="xs">{banner.status === 'active' ? t('status.record.active') : t('status.record.inactive')}</Badge>
          <Badge tone={LIVE_TONE[state]} size="xs">{t(`banners.live.${state}`)}</Badge>
        </span>
      </span>
      <span className="flex shrink-0 items-center">
        <button type="button" className={ICON_BUTTON} disabled={position === 0} onClick={onUp} aria-label={t('banners.order.up', { name: banner.title })} title={t('banners.order.up', { name: banner.title })}>
          <ArrowUp className="size-4" aria-hidden />
        </button>
        <button type="button" className={ICON_BUTTON} disabled={position === total - 1} onClick={onDown} aria-label={t('banners.order.down', { name: banner.title })} title={t('banners.order.down', { name: banner.title })}>
          <ArrowDown className="size-4" aria-hidden />
        </button>
      </span>
    </li>
  );
}

/** Every banner as a row to drag into the order the carousel shows them in (a handle for the mouse and the keyboard, and up / down buttons). */
export function BannerOrder({ banners, onMove }: { banners: Banner[]; onMove: (ids: number[]) => void }) {
  const { t } = useTranslation();
  const ids = banners.map((b) => b.id);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const place = (id: UniqueIdentifier) => ids.indexOf(Number(id)) + 1;
  const name = (id: UniqueIdentifier) => banners.find((b) => b.id === Number(id))?.title ?? '';
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    onMove(arrayMove(ids, ids.indexOf(Number(active.id)), ids.indexOf(Number(over.id))));
  };
  const shift = (from: number, to: number) => onMove(arrayMove(ids, from, to));

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      accessibility={{
        screenReaderInstructions: { draggable: t('banners.order.instructions') },
        announcements: {
          onDragStart: ({ active }) => t('banners.order.picked', { name: name(active.id), n: place(active.id) }),
          onDragOver: ({ active, over }) => (over ? t('banners.order.over', { name: name(active.id), to: place(over.id) }) : undefined),
          onDragEnd: ({ active, over }) => (over ? t('banners.order.dropped', { name: name(active.id), to: place(over.id) }) : t('banners.order.cancelled')),
          onDragCancel: () => t('banners.order.cancelled'),
        },
      }}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ol className="space-y-2" aria-label={t('banners.order.title')}>
          {banners.map((b, i) => (
            <Row key={b.id} banner={b} position={i} total={banners.length} onUp={() => shift(i, i - 1)} onDown={() => shift(i, i + 1)} />
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  );
}
