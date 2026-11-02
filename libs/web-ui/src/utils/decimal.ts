/**
 * Decimal strings from the server (quantities, unit costs) shown for people: trailing zeros dropped, the thousands and
 * decimal separators of the language. Strings only: a decimal never goes through a float here.
 */
export function formatDecimal(value: string, language: string, minFraction = 0): string {
  const negative = value.startsWith('-');
  const [intPart = '0', fraction = ''] = value.replace('-', '').split('.');
  let frac = fraction.replace(/0+$/, '');
  while (frac.length < minFraction) frac += '0';
  const groupSep = language.startsWith('id') ? '.' : ',';
  const decimalSep = language.startsWith('id') ? ',' : '.';
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, groupSep);
  return `${negative ? '-' : ''}${grouped}${frac ? decimalSep + frac : ''}`;
}

/** A quantity as typed: digits with at most `places` decimals (a dot). The server validates again; this only stops typos early. */
export const isDecimal = (v: string, places: number) => new RegExp(`^\\d+(\\.\\d{1,${places}})?$`).test(v.trim());

/**
 * A decimal string rounded to `places` decimals, half away from zero, done on the digits (no float). For DISPLAY only:
 * totals and margins always come from the server's exact sums.
 */
export function roundTo(value: string, places: number): string {
  const negative = value.startsWith('-');
  const [intPart = '0', fraction = ''] = value.replace('-', '').split('.');
  if (fraction.length <= places) return value;
  const rounded = BigInt(intPart + fraction.slice(0, places)) + (fraction.charCodeAt(places) >= 53 ? 1n : 0n);
  const digits = rounded.toString().padStart(places + 1, '0');
  const out = places ? `${digits.slice(0, -places)}.${digits.slice(-places)}` : digits;
  return (negative && rounded !== 0n ? '-' : '') + out;
}
