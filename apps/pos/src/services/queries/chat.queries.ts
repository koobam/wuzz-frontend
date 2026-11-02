import { createQueryKeys } from '@lukemorales/query-key-factory';
import { fetchConversations } from '@/core/api';

export const chatQueries = createQueryKeys('chat', {
  conversations: (token: string) => ({
    queryKey: [token],
    queryFn: ({ signal }) => fetchConversations(token, signal),
  }),
});
