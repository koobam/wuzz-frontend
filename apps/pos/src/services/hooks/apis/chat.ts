import { useQuery } from '@tanstack/react-query';
import { queries } from '@/services/queries';

export const useConversations = (token: string | undefined, options: { enabled: boolean }) =>
  useQuery({ ...queries.chat.conversations(token!), enabled: !!token && options.enabled, refetchInterval: 15_000 });
