import { useQueryClient } from '@tanstack/react-query';
import { Check, CheckCheck, Minus, Send, X } from 'lucide-react';
import type { Channel, Socket } from 'phoenix';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import { Avatar } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import type { OnlineUser } from '@/core/api';
import { connectSocket, fetchMessages, openDirect, type ChatMessage, type DirectConversation } from '@/core/api';
import { useSession } from '@/services/hooks/use-session';

type Peer = { id: string; name: string };
type Win = Peer & { minimized: boolean };

const MAX_WINDOWS = 3;
const ChatContext = createContext<{ open: (peer: Peer) => void } | null>(null);

/** Opens a chat bubble with a teammate. A no-op outside the dock, so callers need not care. */
export function useChat() {
  return useContext(ChatContext) ?? { open: () => undefined };
}

/**
 * The team chat: one socket for the app, a bubble per conversation docked at the bottom right. A bubble
 * opens when you click someone, or by itself (minimised, with a badge) when someone writes to you.
 */
export function ChatDock({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const myId = session?.user.id;
  // Read when the socket (re)connects, so a refreshed token is used without rebuilding the socket.
  const token = useRef('');
  token.current = session?.access_token ?? '';

  const [socket, setSocket] = useState<Socket | null>(null);
  const [wins, setWins] = useState<Win[]>([]);

  useEffect(() => {
    if (!myId) return;
    const s = connectSocket(() => token.current);
    setSocket(s);
    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [myId]);

  const open = useCallback((peer: Peer) => {
    setWins((prev) =>
      prev.some((w) => w.id === peer.id)
        ? prev.map((w) => (w.id === peer.id ? { ...w, minimized: false } : w))
        : [...prev, { ...peer, minimized: false }].slice(-MAX_WINDOWS),
    );
  }, []);

  // Someone wrote to me: put their bubble up, minimised, so the message is not missed.
  useEffect(() => {
    if (!socket || !myId) return;
    const channel = socket.channel(`inbox:user:${myId}`);
    channel.on('conversation_updated', (c: DirectConversation) => {
      if (c.kind !== 'direct') return;
      const other = c.customer_id === myId ? c.peer_id : c.customer_id;
      if (!other) return;
      const known = queryClient.getQueryData<OnlineUser[]>(['presence'])?.find((u) => u.id === other)?.name;
      setWins((prev) =>
        prev.some((w) => w.id === other) ? prev : [...prev, { id: other, name: known ?? other, minimized: true }].slice(-MAX_WINDOWS),
      );
    });
    channel.join();
    return () => {
      channel.leave();
    };
  }, [socket, myId, queryClient]);

  const value = useMemo(() => ({ open }), [open]);

  return (
    <ChatContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 bottom-4 z-40 hidden items-end gap-3 sm:flex">
        {socket && myId
          ? wins.map((w) => (
              <ChatWindow
                key={w.id}
                peer={w}
                myId={myId}
                socket={socket}
                getToken={() => token.current}
                minimized={w.minimized}
                onToggle={() => setWins((prev) => prev.map((x) => (x.id === w.id ? { ...x, minimized: !x.minimized } : x)))}
                onClose={() => setWins((prev) => prev.filter((x) => x.id !== w.id))}
              />
            ))
          : null}
      </div>
    </ChatContext.Provider>
  );
}

/** Within this many pixels of the end counts as "at the bottom": sub-pixel scroll positions never land exactly on it. */
const BOTTOM_SLACK = 48;

const dayKey = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

type Row = { kind: 'day'; key: string; at: string } | { kind: 'message'; message: ChatMessage };

/** The messages with a day marker before the first one of each calendar day (the viewer's own timezone). */
function withDays(messages: ChatMessage[]): Row[] {
  const rows: Row[] = [];
  let last = '';
  for (const message of messages) {
    const key = dayKey(message.inserted_at);
    if (key !== last) rows.push({ kind: 'day', key, at: message.inserted_at });
    last = key;
    rows.push({ kind: 'message', message });
  }
  return rows;
}

function ChatWindow({
  peer,
  myId,
  socket,
  getToken,
  minimized,
  onToggle,
  onClose,
}: {
  peer: Peer;
  myId: string;
  socket: Socket;
  getToken: () => string;
  minimized: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [unread, setUnread] = useState(0);
  // When the other person last read the thread (ISO); null until they have.
  const [peerReadAt, setPeerReadAt] = useState<string | null>(null);
  // Messages from them that arrived while you were scrolled up, shown as the "+N new messages" pill.
  const [newBelow, setNewBelow] = useState(0);
  const [atBottom, setAtBottom] = useState(true);
  const [visible, setVisible] = useState(() => !document.hidden);
  const channel = useRef<Channel | null>(null);
  const list = useRef<HTMLDivElement>(null);
  const atBottomNow = useRef(true);
  // Set when the next render must end at the bottom no matter where the list was: your own message, first load.
  const stickToBottom = useRef(true);
  const readUpTo = useRef('');
  const minimizedNow = useRef(minimized);
  minimizedNow.current = minimized;

  const timeFmt = useMemo(() => new Intl.DateTimeFormat(i18n.language, { hour: '2-digit', minute: '2-digit' }), [i18n.language]);
  const dayFmt = useMemo(
    () => new Intl.DateTimeFormat(i18n.language, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    [i18n.language],
  );
  const dayLabel = (iso: string) => {
    const key = dayKey(iso);
    const now = new Date();
    if (key === dayKey(now.toISOString())) return t('chat.today');
    now.setDate(now.getDate() - 1);
    if (key === dayKey(now.toISOString())) return t('chat.yesterday');
    return dayFmt.format(new Date(iso));
  };

  const add = useCallback((incoming: ChatMessage[]) => {
    setMessages((prev) => {
      const seen = new Set(prev.map((m) => m.id));
      const fresh = incoming.filter((m) => !seen.has(m.id));
      return fresh.length ? [...prev, ...fresh] : prev;
    });
  }, []);

  const readAt = useCallback((iso: string) => setPeerReadAt((prev) => (prev && Date.parse(prev) >= Date.parse(iso) ? prev : iso)), []);

  useEffect(() => {
    let cancelled = false;
    let ch: Channel | null = null;
    openDirect(getToken(), peer.id)
      .then(async (conversation) => {
        if (cancelled) return;
        ch = socket.channel(`conversation:${conversation.id}`);
        channel.current = ch;
        // Listen before loading history so nothing sent in between is lost; ids de-duplicate the overlap.
        ch.on('message', (m: ChatMessage) => {
          if (m.sender_id === myId) stickToBottom.current = true;
          else if (!atBottomNow.current && !minimizedNow.current) setNewBelow((n) => n + 1);
          add([m]);
          if (m.sender_id !== myId && (minimizedNow.current || document.hidden)) setUnread((n) => n + 1);
        });
        ch.on('read', (p: { user_id: string; read_at: string }) => {
          if (p.user_id === peer.id) readAt(p.read_at);
        });
        ch.join();
        const history = await fetchMessages(getToken(), conversation.id);
        if (cancelled) return;
        stickToBottom.current = true;
        add(history);
        const theirs = conversation.reads?.[peer.id];
        if (theirs) readAt(theirs);
        if (minimizedNow.current && history.at(-1) && history.at(-1)!.sender_id !== myId) setUnread(1);
        setState('ready');
      })
      .catch(() => !cancelled && setState('error'));
    return () => {
      cancelled = true;
      ch?.leave();
      channel.current = null;
    };
  }, [peer.id, socket, myId, getToken, add, readAt]);

  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // Opening the bubble again lands on the latest message with nothing pending. Declared before the scroll
  // effect below on purpose: effects run in order.
  useEffect(() => {
    if (minimized) return;
    setUnread(0);
    setNewBelow(0);
    stickToBottom.current = true;
    // A short list never scrolls, so no scroll event would correct a stale "scrolled up".
    atBottomNow.current = true;
    setAtBottom(true);
  }, [minimized]);

  const toBottom = (smooth: boolean) => list.current?.scrollTo({ top: list.current.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });

  useEffect(() => {
    if (minimized) return;
    if (stickToBottom.current || atBottomNow.current) toBottom(false);
    stickToBottom.current = false;
  }, [messages, minimized]);

  const onScroll = () => {
    const el = list.current;
    if (!el) return;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight <= BOTTOM_SLACK;
    atBottomNow.current = near;
    setAtBottom(near);
    if (near) setNewBelow(0);
  };

  // Read means in front of you: the bubble is open, the tab is showing and you are at the latest message.
  // Scrolled up, the new message is only a pill, so it is not read yet.
  useEffect(() => {
    if (state !== 'ready' || minimized || !visible || !atBottom) return;
    const last = messages.findLast((m) => m.sender_id !== myId);
    if (!last || readUpTo.current === last.id) return;
    readUpTo.current = last.id;
    channel.current?.push('read', {}).receive('error', () => (readUpTo.current = ''));
  }, [messages, minimized, visible, atBottom, state, myId]);

  const send = (e: FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body || !channel.current) return;
    channel.current.push('message', { body });
    setDraft('');
  };

  const rows = useMemo(() => withDays(messages), [messages]);

  return (
    <section
      className={`pointer-events-auto flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-[width] duration-200 ${
        minimized ? 'w-64' : 'w-80'
      }`}
      aria-label={t('chat.with', { name: peer.name })}
    >
      <header className="flex items-center gap-2 px-3 py-2.5">
        <button type="button" onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-2 text-left" aria-expanded={!minimized}>
          <Avatar id={peer.id} name={peer.name} size={30} online />
          <span className="min-w-0 flex-1 truncate text-sm font-medium">{peer.name}</span>
          {unread > 0 ? (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1.5 text-[10px] font-semibold text-white">{unread}</span>
          ) : null}
        </button>
        <button type="button" onClick={onToggle} aria-label={t('chat.minimize')} className="grid size-7 place-items-center rounded-full text-muted-foreground hover:bg-accent">
          <Minus className="size-4" />
        </button>
        <button type="button" onClick={onClose} aria-label={t('chat.close')} className="grid size-7 place-items-center rounded-full text-muted-foreground hover:bg-accent">
          <X className="size-4" />
        </button>
      </header>

      {!minimized && (
        <>
          <div className="relative border-t border-border">
            <div ref={list} onScroll={onScroll} className="flex h-72 flex-col gap-1.5 overflow-y-auto bg-muted/40 p-3">
              {state === 'error' ? (
                <p className="m-auto text-center text-xs text-muted-foreground">{t('chat.error')}</p>
              ) : messages.length === 0 && state === 'ready' ? (
                <p className="m-auto text-center text-xs text-muted-foreground">{t('chat.empty', { name: peer.name })}</p>
              ) : (
                rows.map((row) => {
                  if (row.kind === 'day') {
                    return (
                      <div key={`day-${row.key}`} className="my-1 flex justify-center">
                        <span className="rounded-full border border-border bg-card px-3 py-0.5 text-[11px] text-muted-foreground">{dayLabel(row.at)}</span>
                      </div>
                    );
                  }
                  const m = row.message;
                  const mine = m.sender_id === myId;
                  const seen = mine && peerReadAt !== null && Date.parse(peerReadAt) >= Date.parse(m.inserted_at);
                  return (
                    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`flex max-w-[80%] flex-col rounded-2xl px-3 py-1.5 text-sm ${
                          mine ? 'rounded-br-md bg-ink text-background' : 'rounded-bl-md border border-border bg-card'
                        }`}
                      >
                        <span className="break-words whitespace-pre-wrap">{m.body}</span>
                        <span className="mt-0.5 flex items-center justify-end gap-1 text-[10px] opacity-70">
                          {timeFmt.format(new Date(m.inserted_at))}
                          {mine ? (
                            <>
                              {seen ? <CheckCheck className="size-3.5 text-brand" aria-hidden /> : <Check className="size-3.5" aria-hidden />}
                              <span className="sr-only">{seen ? t('chat.read') : t('chat.sent')}</span>
                            </>
                          ) : null}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {newBelow > 0 ? (
              <button
                type="button"
                onClick={() => {
                  toBottom(true);
                  setNewBelow(0);
                }}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-xs font-medium text-white"
              >
                {t('chat.newMessages', { count: newBelow })}
              </button>
            ) : null}
          </div>
          <form onSubmit={send} className="flex gap-2 border-t border-border p-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t('chat.placeholder')}
              disabled={state !== 'ready'}
              maxLength={2000}
              className="min-w-0 flex-1 rounded-full border border-input bg-background px-4 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!draft.trim() || state !== 'ready'}
              aria-label={t('chat.send')}
              className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-background disabled:opacity-40"
            >
              <Send className="size-4" />
            </button>
          </form>
        </>
      )}
    </section>
  );
}
