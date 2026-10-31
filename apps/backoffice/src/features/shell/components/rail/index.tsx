import { LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/services/providers/theme-provider';
import { OnlineUsers } from '../online-users';
import { useTranslation } from '@/core/utils/i18n';
import { useLogout } from '@/services/hooks/use-session';

const PILL = 'flex flex-col items-center gap-1 rounded-full bg-card p-1.5 border border-border';
const BTN = 'grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground';

/** The left rail (lg and up): the theme at the top, the way out at the bottom. */
export function Rail() {
  const { t } = useTranslation();
  const { theme, toggle } = useTheme();
  const logout = useLogout();

  return (
    <aside className="absolute top-[5.25rem] bottom-5 left-5 z-30 hidden w-12 flex-col justify-between lg:flex">
      <div className="flex flex-col items-center gap-3">
      <div className={PILL}>
          <button
            type="button"
            onClick={theme === 'dark' ? toggle : undefined}
            aria-label={t('nav.themeLight')}
            aria-pressed={theme === 'light'}
            className={`${BTN} ${theme === 'light' ? 'bg-accent text-foreground' : ''}`}
          >
            <Sun className="size-4" />
          </button>
          <button
            type="button"
            onClick={theme === 'light' ? toggle : undefined}
            aria-label={t('nav.themeDark')}
            aria-pressed={theme === 'dark'}
            className={`${BTN} ${theme === 'dark' ? 'bg-accent text-foreground' : ''}`}
          >
            <Moon className="size-4" />
          </button>
        </div>
  <OnlineUsers />
      </div>
      <div className={PILL}>
        <button type="button" onClick={() => logout.mutate()} aria-label={t('nav.signOut')} title={t('nav.signOut')} className={BTN}>
          <LogOut className="size-4" />
        </button>
      </div>
    </aside>
  );
}
