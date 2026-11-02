import type { Banner, BannerLiveState, BannerTargetType } from '@/core/api';
import { env } from '@/config/env';

type T = (key: string, options?: Record<string, unknown>) => string;

/**
 * Why a banner is or is not on a phone. `is_live` comes from the server's clock; the reason for "not live" is read from the
 * banner itself (off, not started yet, already over), so an active banner that nobody sees is explained.
 */
export function liveState(b: Pick<Banner, 'is_live' | 'status' | 'starts_at' | 'ends_at'>, now = Date.now()): BannerLiveState {
  if (b.is_live) return 'live';
  if (b.status === 'inactive') return 'off';
  if (b.starts_at && new Date(b.starts_at).getTime() > now) return 'scheduled';
  if (b.ends_at && new Date(b.ends_at).getTime() <= now) return 'ended';
  return 'off';
}

export const LIVE_TONE = { live: 'good', scheduled: 'info', ended: 'muted', off: 'warn' } as const;

/** The browser's zone as the Indonesian short name when it is one of the three, else the offset ("GMT+8"). */
export function zoneName(): string {
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (zone === 'Asia/Jakarta' || zone === 'Asia/Pontianak') return 'WIB';
  if (zone === 'Asia/Makassar') return 'WITA';
  if (zone === 'Asia/Jayapura') return 'WIT';
  return new Intl.DateTimeFormat('en', { timeZoneName: 'short' }).formatToParts(new Date()).find((p) => p.type === 'timeZoneName')?.value ?? zone;
}

/** "31 Oct, 19:08" (with the year when it is not this one): a moment short enough for a table cell. */
export function shortMoment(iso: string, language: string): string {
  const d = new Date(iso);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return new Intl.DateTimeFormat(language, { day: 'numeric', month: 'short', ...(sameYear ? {} : { year: 'numeric' }), hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
}

const moment = (iso: string, language: string) =>
  new Intl.DateTimeFormat(language, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso));

/** "1 Nov 2026, 08:00 – 30 Nov 2026, 23:59" for a window, "Always on" when it has no limits, "From …" / "Until …" for one open end. */
export function scheduleText(startsAt: string | null | undefined, endsAt: string | null | undefined, t: T, language: string): string {
  if (!startsAt && !endsAt) return t('banners.schedule.always');
  if (startsAt && endsAt) return `${moment(startsAt, language)} – ${moment(endsAt, language)}`;
  if (startsAt) return t('banners.schedule.from', { at: moment(startsAt, language) });
  return t('banners.schedule.until', { at: moment(endsAt!, language) });
}

/** A sentence for the form's schedule card: what the two moments mean together, in the browser's zone. */
export function scheduleSentence(startsAt: string, endsAt: string, t: T, language: string): string {
  const s = startsAt ? new Date(startsAt).toISOString() : null;
  const e = endsAt ? new Date(endsAt).toISOString() : null;
  if (!s && !e) return t('banners.schedule.sentenceAlways');
  const zone = zoneName();
  if (s && e) return t('banners.schedule.sentenceBoth', { start: moment(s, language), end: moment(e, language), zone });
  if (s) return t('banners.schedule.sentenceFrom', { start: moment(s, language), zone });
  return t('banners.schedule.sentenceUntil', { end: moment(e!, language), zone });
}

/** The link the customer app opens for a target, as the server builds it (shown live in the form before the banner is saved). */
export function previewDeeplink(type: BannerTargetType, value: string): string {
  const v = value.trim();
  if (type === 'none' || !v) return '';
  if (type === 'service') return `${env.VITE_APP_SCHEME}://service/${v}`;
  if (type === 'outlet') return `${env.VITE_APP_SCHEME}://outlet/${v}`;
  if (type === 'screen') return `${env.VITE_APP_SCHEME}://screen/${v}`;
  return v;
}
