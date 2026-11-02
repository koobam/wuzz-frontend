import { Link } from '@tanstack/react-router';
import { GripVertical, Pencil, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from '@/core/utils/i18n';
import { navigation, type NavChild, type NavItem } from '@/config/navigation';
import { useSession } from '@/services/hooks/use-session';

type Shortcut = { to: NavItem['to'] | NavChild['to']; label: string; icon: NavChild['icon'] };

/** Every page the navbar reaches, flattened (a dropdown contributes its pages): so a new page shows up here by being added to `navigation`. */
const shortcuts: Shortcut[] = navigation
  .filter((item) => item.to !== '/')
  .flatMap((item): Shortcut[] => item.children ?? [{ to: item.to, label: item.label, icon: item.icon }]);

const PILL = 'flex items-center gap-2 rounded-full border bg-card py-1.5 pr-4 pl-1.5 text-sm';
const ICON = 'grid size-7 place-items-center rounded-full bg-muted';
const TINY = 'grid size-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent disabled:opacity-30';

/** What this browser remembers of one account's shortcuts: the pages (by route), in order. Anything unreadable is "no choice yet". */
const storeKey = (userId: string) => `backoffice.quick-access.${userId}`;
function read(userId: string): string[] | null {
  try {
    const raw = localStorage.getItem(storeKey(userId));
    const list: unknown = raw ? JSON.parse(raw) : null;
    return Array.isArray(list) ? list.filter((x): x is string => typeof x === 'string') : null;
  } catch {
    return null;
  }
}
function write(userId: string, list: string[] | null) {
  try {
    if (list) localStorage.setItem(storeKey(userId), JSON.stringify(list));
    else localStorage.removeItem(storeKey(userId));
  } catch {
    // Storage blocked: the choice just lasts until the page is closed.
  }
}

/**
 * One tap to any page, under the greeting. Each person picks which pages are here and in what order (Edit): by default it is
 * every page. The choice is kept per account, in this browser. Flat pills, no shadow.
 */
export function QuickAccess() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const userId = session?.user.id ?? '';
  const [saved, setSaved] = useState<string[] | null>(() => (userId ? read(userId) : null));
  const [editing, setEditing] = useState(false);
  // The pill being dragged and the one it is over, by index.
  const [drag, setDrag] = useState<{ from: number; over: number } | null>(null);
  // The session can arrive after the first render; the choice is that account's.
  useEffect(() => setSaved(userId ? read(userId) : null), [userId]);

  // The chosen pages that still exist, in the chosen order; with no choice, all of them.
  const chosen = saved ? saved.map((to) => shortcuts.find((s) => s.to === to)).filter((s): s is Shortcut => !!s) : shortcuts;
  const rest = shortcuts.filter((s) => !chosen.includes(s));

  const commit = (list: Shortcut[] | null) => {
    const next = list ? list.map((s) => s.to as string) : null;
    setSaved(next);
    if (userId) write(userId, next);
  };
  // Takes the pill at `from` out and puts it where `to` was.
  const moveTo = (from: number, to: number) => {
    if (from === to || to < 0 || to >= chosen.length) return;
    const next = [...chosen];
    next.splice(to, 0, next.splice(from, 1)[0]!);
    commit(next);
  };

  return (
    <section aria-label={t('dashboard.quickAccess')} className="flex shrink-0 flex-wrap items-center gap-2">
      <span className="mr-1 text-sm text-muted-foreground">{t('dashboard.quickAccess')}</span>
      {chosen.map((s, i) =>
        editing ? (
          <span
            key={s.to}
            draggable
            tabIndex={0}
            role="listitem"
            aria-label={t('dashboard.quickAccessDrag', { name: t(s.label) })}
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = 'move';
              setDrag({ from: i, over: i });
            }}
            onDragOver={(e) => {
              e.preventDefault();
              if (drag && drag.over !== i) setDrag({ ...drag, over: i });
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (drag) moveTo(drag.from, i);
              setDrag(null);
            }}
            onDragEnd={() => setDrag(null)}
            // Without a mouse: Left and Right move the focused pill.
            onKeyDown={(e) => {
              if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
              e.preventDefault();
              moveTo(i, i + (e.key === 'ArrowLeft' ? -1 : 1));
            }}
            className={`${PILL} cursor-grab border-foreground/30 pl-1 active:cursor-grabbing ${drag?.from === i ? 'opacity-40' : ''} ${drag && drag.over === i && drag.from !== i ? 'border-foreground' : ''}`}
          >
            <GripVertical className="size-4 text-muted-foreground" aria-hidden />
            <span className={ICON}>
              <s.icon className="size-4" />
            </span>
            {t(s.label)}
            <button type="button" onClick={() => commit(chosen.filter((x) => x !== s))} aria-label={t('dashboard.quickAccessRemove', { name: t(s.label) })} className={TINY}>
              <X className="size-3.5" />
            </button>
          </span>
        ) : (
          <Link key={s.to} to={s.to} className={`${PILL} border-border transition-colors hover:bg-accent`}>
            <span className={ICON}>
              <s.icon className="size-4" />
            </span>
            {t(s.label)}
          </Link>
        ),
      )}
      {editing &&
        rest.map((s) => (
          <button key={s.to} type="button" onClick={() => commit([...chosen, s])} aria-label={t('dashboard.quickAccessAdd', { name: t(s.label) })} className={`${PILL} border-dashed border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground`}>
            <span className={ICON}>
              <Plus className="size-4" />
            </span>
            {t(s.label)}
          </button>
        ))}
      {editing ? (
        <>
          <button type="button" onClick={() => setEditing(false)} className="rounded-full bg-ink px-4 py-1.5 text-sm font-medium text-background">
            {t('dashboard.quickAccessDone')}
          </button>
          <button type="button" onClick={() => commit(null)} className="rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">
            {t('dashboard.quickAccessReset')}
          </button>
        </>
      ) : (
        <button type="button" onClick={() => setEditing(true)} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
          <Pencil className="size-3.5" />
          {t('dashboard.quickAccessEdit')}
        </button>
      )}
    </section>
  );
}
