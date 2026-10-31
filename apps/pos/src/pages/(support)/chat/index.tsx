import { Page } from '@wuzz/web-ui';
import { ConversationList, Thread, useChatPage } from '@/features/chat';
import { useTranslation } from '@/core/utils/i18n';

export function ChatPage() {
  const { t } = useTranslation();
  const c = useChatPage();

  if (!c.token) return <p className="text-sm text-muted-foreground">{t('chat.needsSession')}</p>;

  return (
    <Page title={t('nav.chat')} subtitle={t('chat.subtitle')}>
      <div className="grid min-h-0 flex-1 grid-cols-[16rem_1fr] overflow-hidden rounded-3xl border border-border bg-card">
        <ConversationList conversations={c.conversations} activeId={c.activeId} online={c.online} onSelect={c.setActiveId} />
        {c.activeId && c.online ? (
          <Thread key={c.activeId} id={c.activeId} token={c.token} />
        ) : (
          <div className="flex items-center justify-center text-sm text-muted-foreground">{t('chat.select')}</div>
        )}
      </div>
    </Page>
  );
}
