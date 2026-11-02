// The session lives in localStorage so a reload keeps the cashier signed in.

export const AUDIENCE = 'pos';
const KEY = `${AUDIENCE}.session`;

export type SessionUser = { id: string; name: string; phone: string; roles: string[] };
export type Session = {
  user: SessionUser;
  access_token: string;
  refresh_token: string;
  expires_at: string;
};

export function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function writeSession(session: Session | null) {
  try {
    if (session) localStorage.setItem(KEY, JSON.stringify(session));
    else localStorage.removeItem(KEY);
  } catch {
    // Storage unavailable: the session just won't survive a reload.
  }
}
