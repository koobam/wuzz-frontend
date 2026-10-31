/** A wall-clock time as the server and the forms write it: "HH:MM", 24 hours. */
export const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const two = (n: number) => String(n).padStart(2, '0');

/** "08:30" from an hour and a minute. */
export const formatTime = (hour: number, minute: number) => `${two(hour)}:${two(minute)}`;

/** The hour and minute of an "HH:MM" string, or null when it is not one. */
export function splitTime(value: string): { hour: number; minute: number } | null {
  if (!TIME_PATTERN.test(value)) return null;
  return { hour: Number(value.slice(0, 2)), minute: Number(value.slice(3)) };
}

/**
 * Reads what a person types as a time: `0830`, `830`, `8:30`, `08.30`, `8` (= 08:00), `08:30`. Returns "HH:MM", or null when
 * it is not a valid 24-hour time.
 */
export function parseTime(text: string): string | null {
  const t = text.trim();
  const sep = /^(\d{1,2})[:.\s](\d{1,2})$/.exec(t);
  if (sep) return build(Number(sep[1]), Number(sep[2]));
  if (!/^\d{1,4}$/.test(t)) return null;
  if (t.length <= 2) return build(Number(t), 0);
  return build(Number(t.slice(0, t.length - 2)), Number(t.slice(-2)));
}

function build(hour: number, minute: number) {
  return hour <= 23 && minute <= 59 ? formatTime(hour, minute) : null;
}
