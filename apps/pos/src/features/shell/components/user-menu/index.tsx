import { ChevronDown, LogOut, Moon, Sun } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/services/providers/theme-provider';
import { useTranslation } from '@/core/utils/i18n';
import { useLogout, useSession } from '@/services/hooks/use-session';

/** "Kasir Pusat" -> "KP", whatever there is, at most two letters. */
function initials(from: string): string {
  const parts = from.trim().split(/[\s@._-]+/).filter(Boolean);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
}

export function UserMenu() {
  const { t } = useTranslation();
  const { theme, toggle } = useTheme();
  const { data: session } = useSession();
  const logout = useLogout();
  const [open, setOpen] = useState(false);
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

  const name = session?.user.name ?? '';
  const roles = session?.user.roles ?? [];
  // What the person is here: the outlet they work at, or an admin.
  const outlet = roles.find((r) => r.startsWith('outlet:'))?.slice('outlet:'.length);
  const role = outlet ? t('nav.outlet', { id: outlet }) : roles.includes('admin') ? t('nav.admin') : '';
  const item = 'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-accent';

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t('nav.account')}
        className="flex items-center gap-3 rounded-full border border-border bg-card py-1.5 pr-3 pl-1.5 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <span className="grid size-9 place-items-center rounded-full bg-ink text-xs font-medium text-background">{initials(name)}</span>
        <span className="hidden text-left leading-tight md:block">
          <span className="block text-sm font-medium">{name}</span>
          {role ? <span className="block text-xs text-muted-foreground">{role}</span> : null}
        </span>
        <ChevronDown className={`size-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open ? (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-52 rounded-2xl border border-border bg-card p-1.5 text-sm">
          <div className="px-3 py-1.5 text-xs text-muted-foreground md:hidden">{name}</div>
          {/* The rail has the theme toggle from lg up; below that it lives here. */}
          <button type="button" role="menuitem" onClick={toggle} className={`${item} lg:hidden`}>
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            {theme === 'dark' ? t('nav.themeLight') : t('nav.themeDark')}
          </button>
          <button type="button" role="menuitem" onClick={() => logout.mutate()} className={`${item} text-destructive`}>
            <LogOut className="size-4" />
            {t('nav.signOut')}
          </button>
        </div>
      ) : null}
    </div>
  );
}
