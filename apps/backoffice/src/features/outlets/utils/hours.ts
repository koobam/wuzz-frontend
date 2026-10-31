import type { OutletDay, OutletTimezone } from '@/core/api';

/** Whether a day runs past midnight: it closes at an earlier clock time than it opens ("22:00" to "02:00"). */
export const closesAfterMidnight = (open: string, close: string) => close < open;

/** The times a new outlet starts with. */
export const DEFAULT_OPEN = '08:00';
export const DEFAULT_CLOSE = '22:00';

/** A whole week, Monday first, every day open from `open` to `close`. */
export const week = (open = DEFAULT_OPEN, close = DEFAULT_CLOSE, closedDays: number[] = []): OutletDay[] =>
  Array.from({ length: 7 }, (_, weekday) => (closedDays.includes(weekday) ? { weekday, closed: true, open_24h: false, open_time: '', close_time: '' } : { weekday, closed: false, open_24h: false, open_time: open, close_time: close }));

/** The server's seven days in Monday-first order; if they are missing (an older answer) the default week. */
export const orderedWeek = (hours: OutletDay[] | undefined): OutletDay[] => {
  if (!hours || hours.length !== 7) return week();
  return [...hours].map((d) => ({ ...d, open_24h: d.open_24h ?? false })).sort((a, b) => a.weekday - b.weekday);
};

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Which day of the week it is, and the clock, at `now` in the outlet's own zone. `weekday` 0 is Monday, like the server's. */
export function inZone(timezone: OutletTimezone, now: Date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: timezone, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return { weekday: Math.max(0, WEEKDAYS.indexOf(get('weekday'))), time: `${get('hour')}:${get('minute')}` };
}

/** Every day open all day. */
export const week24 = (): OutletDay[] => Array.from({ length: 7 }, (_, weekday) => ({ weekday, closed: false, open_24h: true, open_time: '00:00', close_time: '00:00' }));

/** What a day is: open between two times, closed, or open all day. */
export const dayMode = (d: Pick<OutletDay, 'closed' | 'open_24h'>) => (d.closed ? 'closed' : d.open_24h ? 'open24' : 'open');
