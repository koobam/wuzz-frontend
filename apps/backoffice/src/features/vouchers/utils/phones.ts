/** One phone number as the person typed it, and what it came to. */
export type ParsedPhone = { raw: string; phone: string | null };

/**
 * The numbers pasted into the send box. Each is brought to the form the accounts are stored in (country code, no plus, no zero:
 * "6281234567890"): `+62…`, `62…`, `08…` and a bare `8…` all come to that. A number that is not a mobile number (628 and 8 to 12
 * more digits) is `null`.
 */
export function normalizePhone(raw: string): string | null {
  let digits = raw.trim().replace(/[\s().-]/g, '');
  if (digits.startsWith('+')) digits = digits.slice(1);
  if (!/^\d+$/.test(digits)) return null;
  if (digits.startsWith('0')) digits = `62${digits.slice(1)}`;
  else if (digits.startsWith('8')) digits = `62${digits}`;
  return /^628\d{8,12}$/.test(digits) ? digits : null;
}

/** Splits the pasted text into its entries, keeping the order. A space inside a number ("0812 3456 789") is kept together when the line has no other separator. */
export function parsePhones(text: string): ParsedPhone[] {
  return text
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((raw) => ({ raw, phone: normalizePhone(raw) }));
}

/** What the box holds: the valid numbers (each once), how many were repeats, and the lines that are not numbers. */
export function summarizePhones(text: string): { phones: string[]; duplicates: number; invalid: string[] } {
  const seen = new Set<string>();
  const invalid: string[] = [];
  let duplicates = 0;
  for (const { raw, phone } of parsePhones(text)) {
    if (!phone) invalid.push(raw);
    else if (seen.has(phone)) duplicates += 1;
    else seen.add(phone);
  }
  return { phones: [...seen], duplicates, invalid };
}
