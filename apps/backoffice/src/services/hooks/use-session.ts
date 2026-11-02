import type { QueryClient } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { fetchSession, logout, sendCode, type Session, verifyCode } from '@/core/api';

export const sessionKey = ['auth', 'session'] as const;

// Reads the query cache directly rather than a hook, so a router `beforeLoad`
// guard can check it synchronously before any component renders.
export function isAuthenticatedIn(queryClient: QueryClient): boolean {
  return queryClient.getQueryData<Session | null>(sessionKey) != null;
}

export function useSession() {
  const query = useQuery({
    queryKey: sessionKey,
    queryFn: fetchSession,
    // Keeps the access token fresh for the chat socket and REST calls.
    refetchInterval: 5 * 60_000,
  });
  return { ...query, isBootstrapping: query.isLoading };
}

export function useSendCode() {
  return useMutation({ mutationFn: sendCode });
}

export function useVerifyCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ phone, code }: { phone: string; code: string }) => verifyCode(phone, code),
    onSuccess: (session) => queryClient.setQueryData(sessionKey, session),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      // Everything cached belongs to the person who just left: the next one to sign in on this screen must not see it,
      // not even for a moment. Then back to the sign-in page, as nothing on screen is theirs to use any more.
      queryClient.clear();
      queryClient.setQueryData(sessionKey, null);
      await router.invalidate();
      await router.navigate({ to: '/login', search: { redirect: undefined } });
    },
  });
}
