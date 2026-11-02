import { useState } from 'react';
import { useOnline } from '@/core/pos/hooks';
import { useConversations } from '@/services/hooks/apis';
import { useSession } from '@/services/hooks/use-session';

/** The chat page: the conversations of this till's outlet (while online) and which one is open. */
export function useChatPage() {
  const online = useOnline();
  const token = useSession().data?.access_token;
  const [activeId, setActiveId] = useState<string | null>(null);
  const conversations = useConversations(token, { enabled: online });

  return { online, token, activeId, setActiveId, conversations: conversations.data ?? [] };
}
