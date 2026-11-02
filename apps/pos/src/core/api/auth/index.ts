import { ApiError, publicPost, readSession, refreshSession, type Session, writeSession } from '@/core/http';

export type { Session };

export async function sendCode(phone: string): Promise<void> {
  await publicPost('/auth/send-code', { phone });
}

export async function verifyCode(phone: string, otp_code: string): Promise<Session> {
  const session = await publicPost<Session>('/auth/verify-otp', { phone, otp_code });
  writeSession(session);
  return session;
}

// A dropped connection must not sign a cashier out. Only the server saying the
// session is over (401/403) does; on a network failure the stored session is
// kept, and whatever needs the server says that it cannot be reached.
export async function fetchSession(): Promise<Session | null> {
  const stored = readSession();
  if (!stored) return null;
  if (new Date(stored.expires_at).getTime() - Date.now() > 60_000) return stored;
  try {
    return await refreshSession();
  } catch {
    return readSession();
  }
}

export async function logout(): Promise<void> {
  const session = readSession();
  writeSession(null);
  if (!session) return;
  await publicPost('/auth/logout', { refresh_token: session.refresh_token }).catch((e) => {
    if (!(e instanceof ApiError)) return; // no connection: the server is not told, and the token expires on its own
  });
}
