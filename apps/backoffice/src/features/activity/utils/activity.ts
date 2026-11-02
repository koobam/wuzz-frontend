import type { ActivityAction, ActivityEntity } from '@/core/api';

/** What can be done to each kind of thing (the gateway's table of logged routes), so a modal offers only the actions that can appear in it. */
export const ENTITY_ACTIONS: Record<ActivityEntity, ActivityAction[]> = {
  outlet: ['create', 'update', 'delete'],
  banner: ['create', 'update', 'delete', 'status', 'reorder'],
  voucher: ['create', 'update', 'delete', 'status', 'inject'],
  service: ['create', 'update', 'delete'],
  variant_group: ['create', 'update', 'delete'],
  modifier_group: ['create', 'update', 'delete'],
  material: ['create', 'update', 'delete'],
  bom: ['update'],
  stock: ['receive', 'waste', 'adjust', 'transfer', 'set_min'],
  order: ['create', 'status'],
  user: ['status'],
  session: ['sign_in', 'sign_out'],
  media: ['create'],
};

const REDACTED = '[redacted]';

/** One line of an entry's details: the field and its value as text. Redacted values stay exactly `[redacted]`. */
export type DetailRow = { key: string; value: string };

export function detailRows(changes: Record<string, unknown> | null | undefined): DetailRow[] {
  return Object.entries(changes ?? {}).map(([key, v]) => ({
    key,
    value: v === REDACTED ? REDACTED : typeof v === 'string' ? v : v === null || v === undefined ? '–' : JSON.stringify(v),
  }));
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31_536_000],
  ['month', 2_592_000],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
];

/** "5 minutes ago", "yesterday": the time of an entry in words, in the reader's language. */
export function relativeTime(iso: string, language: string, now = Date.now()): string {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  const format = new Intl.RelativeTimeFormat(language, { numeric: 'auto' });
  for (const [unit, size] of UNITS) if (Math.abs(seconds) >= size) return format.format(Math.round(seconds / size), unit);
  return format.format(seconds, 'second');
}

const title = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "Admin · Finance", "Staff": the part of a person's roles a reader cares about (`outlet:3` is where they work, not what they are). */
export function actorRole(roles: string[]): string {
  const base = roles.find((r) => !r.includes(':'));
  const specific = roles.find((r) => r.startsWith('admin:'))?.slice('admin:'.length);
  return [base, specific].filter((x): x is string => !!x).map(title).join(' · ');
}
