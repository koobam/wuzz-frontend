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

// Offline-first: a cashier whose connection drops mid-shift must still get into
// the app on reload. Only the server saying the session is over (401/403) signs
// them out; a network failure keeps the stored session.
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
    if (!(e instanceof ApiError)) return; // offline: the token will expire on its own
  });
}
