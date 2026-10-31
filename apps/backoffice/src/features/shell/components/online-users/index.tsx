import { useEffect } from 'react';
import { Avatar } from '@wuzz/web-ui';
import { useChat } from '@/features/chat/components/chat-dock';
import { useTranslation } from '@/core/utils/i18n';
import { pingPresence, type OnlineUser } from '@/core/api';
import { useOnlineUsers } from '@/services/hooks/apis';
import { useSession } from '@/services/hooks/use-session';
import { roleLabel } from '../user-menu';

const PING_EVERY = 20_000;
const SHOWN = 4;
const describe = (u: OnlineUser) => {
  const role = roleLabel(u.roles) || (u.roles.some((r) => r.startsWith('outlet:')) ? 'Outlet' : '');
  return role ? `${u.name} · ${role}` : u.name;
};

/**
 * Who is using the apps right now: this app pings while it is open (and visible), and the list is
 * whoever pinged recently. A closed tab stops pinging and drops off within a minute.
 */
export function OnlineUsers() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const chat = useChat();

  useEffect(() => {
    const ping = () => document.visibilityState === 'visible' && void pingPresence().catch(() => undefined);
    ping();
    const timer = setInterval(ping, PING_EVERY);
    document.addEventListener('visibilitychange', ping);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', ping);
    };
  }, []);

  const online = useOnlineUsers();
  const people = online.data ?? [];
  if (people.length === 0) return null;
  const me = session?.user.id;

  return (
    <div
      className="flex flex-col items-center rounded-full border border-border bg-card px-1.5 py-2"
      role="group"
      aria-label={t('nav.online', { count: people.length })}
    >
      <div className="flex flex-col items-center">
        {people.slice(0, SHOWN).map((u, i) => {
          const mine = u.id === me;
          return (
            <button
              key={u.id}
              type="button"
              disabled={mine}
              onClick={() => chat.open({ id: u.id, name: u.name })}
              title={mine ? `${describe(u)} (${t('nav.you')})` : t('chat.with', { name: describe(u) })}
              className={`relative rounded-full border-2 border-card transition-transform duration-150 enabled:hover:z-10 enabled:hover:scale-110 disabled:cursor-default ${i > 0 ? '-mt-2' : ''}`}
              style={{ zIndex: SHOWN - i }}
            >
              <Avatar id={u.id} name={u.name} online />
            </button>
          );
        })}
      </div>
      {people.length > SHOWN && (
        <span className="mt-1 text-[10px] font-medium text-muted-foreground" title={people.slice(SHOWN).map(describe).join('\n')}>
          +{people.length - SHOWN}
        </span>
      )}
    </div>
  );
}
