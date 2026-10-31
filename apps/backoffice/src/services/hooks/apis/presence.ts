import { useQuery } from '@tanstack/react-query';
import { queries } from '@/services/queries';

/** Who is using the apps right now, fetched again every 15 seconds. */
export const useOnlineUsers = () => useQuery({ ...queries.presence.online, refetchInterval: 15_000 });
