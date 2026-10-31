import type { Conversation } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';

/** The conversations to pick from: support threads and the outlet's. */
export function ConversationList({ conversations, activeId, online, onSelect }: { conversations: Conversation[]; activeId: string | null; online: boolean; onSelect: (id: string) => void }) {
  const { t } = useTranslation();
  return (
    <ul className="overflow-y-auto border-r border-border p-2">
      {!online && <li className="p-3 text-xs text-destructive">{t('chat.offline')}</li>}
      {conversations.map((c) => (
        <li key={c.id}>
          <button onClick={() => onSelect(c.id)} className={`w-full rounded-2xl px-3 py-2 text-left text-sm hover:bg-accent ${activeId === c.id ? 'bg-accent' : ''}`}>
            <div className="font-medium">{c.kind === 'support' ? t('chat.support') : t('chat.outlet', { id: c.outlet_id })}</div>
            <div className="text-xs text-muted-foreground">{t('chat.customer', { id: c.customer_id })}</div>
          </button>
        </li>
      ))}
    </ul>
  );
}
