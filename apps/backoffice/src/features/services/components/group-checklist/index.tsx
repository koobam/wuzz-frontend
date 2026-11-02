import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge, cn, Input, rupiah } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';

/** One choice of a group, with what it adds to the price (0 = included). */
export type ChecklistOption = { name: string; price: number };

/** A reusable group a service can carry. Several groups can share a name, so the note and the choices tell them apart. */
export type ChecklistGroup = {
  id: number;
  name: string;
  notes: string;
  /** The rule of the group in words ("Pick one", "Required, 1–2"), and whether choosing is compulsory. */
  rule: string;
  required: boolean;
  options: ChecklistOption[];
};

/** A row: the tick (with the position number when ticked), the group, and, for a ticked one, the handle to drag it with. */
function Row({ group, order, draggable, onToggle, handleLabel }: { group: ChecklistGroup; order: number; draggable: boolean; onToggle: () => void; handleLabel: string }) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: group.id, disabled: !draggable });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('flex items-start bg-background', isDragging && 'relative z-10 border-y border-border bg-accent')}
    >
      {order > 0 ? (
        <button
          type="button"
          ref={setActivatorNodeRef}
          disabled={!draggable}
          aria-label={handleLabel}
          title={handleLabel}
          className="mt-3.5 ml-2 grid size-6 shrink-0 cursor-grab touch-none place-items-center rounded-md text-muted-foreground hover:bg-accent disabled:cursor-default disabled:opacity-30"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" aria-hidden />
        </button>
      ) : null}
      <button type="button" onClick={onToggle} aria-pressed={order > 0} className={cn('flex min-w-0 flex-1 items-start gap-3 py-3 pr-4 text-left transition-colors hover:bg-accent', order > 0 ? 'pl-2' : 'pl-4')}>
        <span className={cn('mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border text-[11px] font-semibold', order > 0 ? 'border-ink bg-ink text-background' : 'border-input')}>{order > 0 ? order : ''}</span>
        <span className="min-w-0 flex-1 space-y-1.5">
          <span className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-sm font-medium">{group.name}</span>
            <span className="text-xs text-muted-foreground">{t('groups.optionCount', { count: group.options.length })}</span>
            <Badge tone={group.required ? 'warn' : 'muted'} size="xs">{group.rule}</Badge>
          </span>
          {group.notes && <span className="line-clamp-2 text-xs text-muted-foreground">{group.notes}</span>}
          <span className="flex flex-wrap gap-1">
            {group.options.map((o, i) => (
              <span key={`${o.name}-${i}`} className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                {o.name}
                {o.price > 0 && <span className="ml-1 text-foreground/70 tabular-nums">+{rupiah(o.price)}</span>}
              </span>
            ))}
          </span>
        </span>
      </button>
    </li>
  );
}

/**
 * Picks which reusable groups a service uses, as a searchable checklist: each row shows the group's name, its internal
 * note and its choices with their prices, so two groups with the same name can be told apart. A ticked group moves to
 * a section of its own above the search, where they can be dragged (or moved with the keyboard) into the order the
 * customer sees them in; the panel keeps a fixed height and each part scrolls inside it; the number on a row is its place. The search below only looks through the groups not chosen yet.
 */
export function GroupChecklist({
  title,
  hint,
  kind,
  groups,
  value,
  onChange,
  empty,
}: {
  title: string;
  hint: string;
  kind: 'variant' | 'modifier';
  groups: ChecklistGroup[];
  value: number[];
  onChange: (ids: number[]) => void;
  empty: string;
}) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const searching = query.trim() !== '';
  const { ticked, rest } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matching = q ? groups.filter((g) => [g.name, g.notes, ...g.options.map((o) => o.name)].some((s) => s.toLowerCase().includes(q))) : groups;
    return {
      // The chosen ones are always all there, whatever the search says.
      ticked: value.map((id) => groups.find((g) => g.id === id)).filter((g): g is ChecklistGroup => !!g),
      rest: matching.filter((g) => !value.includes(g.id)),
    };
  }, [groups, query, value]);
  const toggle = (id: number) => onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    onChange(arrayMove(value, value.indexOf(Number(active.id)), value.indexOf(Number(over.id))));
  };

  return (
    <section className="flex h-[36rem] flex-col overflow-hidden rounded-2xl border border-border bg-background">
      <div className="shrink-0 space-y-1 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">{title}</h3>
          <Badge tone={kind === 'variant' ? 'info' : 'muted'} size="xs">{t(`services.picker.${kind}Badge`)}</Badge>
          <span className="ml-auto text-xs text-muted-foreground">{t('services.picker.selected', { count: value.length })}</span>
        </div>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>

      {groups.length === 0 ? (
        <p className="grid flex-1 place-items-center px-4 py-8 text-center text-sm text-muted-foreground">{empty}</p>
      ) : (
        <>
          {ticked.length > 0 && (
            <div className="max-h-[45%] shrink-0 overflow-y-auto border-b border-border bg-muted/30">
              <p className="px-4 pt-3 pb-1 text-xs font-medium text-muted-foreground">{t('services.picker.chosen')}</p>
              <ul className="divide-y divide-border">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                  <SortableContext items={ticked.map((g) => g.id)} strategy={verticalListSortingStrategy}>
                    {ticked.map((g, i) => (
                      <Row key={g.id} group={g} order={i + 1} draggable={ticked.length > 1} onToggle={() => toggle(g.id)} handleLabel={t('services.picker.drag', { name: g.name })} />
                    ))}
                  </SortableContext>
                </DndContext>
              </ul>
            </div>
          )}
          <div className="relative shrink-0 border-b border-border">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              type="search"
              className="rounded-none border-0 bg-transparent py-2.5 pl-10 focus-visible:ring-0"
              placeholder={t('services.picker.search')}
              aria-label={t('services.picker.search')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <ul className="min-h-0 flex-1 divide-y divide-border overflow-y-auto">
            {rest.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-muted-foreground">{searching ? t('services.picker.noMatch') : t('services.picker.allChosen')}</li>
            )}
            {rest.map((g) => (
              <Row key={g.id} group={g} order={0} draggable={false} onToggle={() => toggle(g.id)} handleLabel="" />
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
