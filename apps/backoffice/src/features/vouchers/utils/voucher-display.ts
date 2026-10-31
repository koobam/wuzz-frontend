import { rupiah } from '@wuzz/web-ui';
import type { Voucher } from '@/core/api';

type T = (key: string, options?: Record<string, unknown>) => string;

export { LIVE_TONE, liveState, scheduleSentence, scheduleText, shortMoment, zoneName } from '@/features/banners/utils/banner-display';

/** The figure on the coupon stub: "20%" or "Rp 10.000". */
export function discountFigure(v: Pick<Voucher, 'discount_type' | 'value'>): string {
  return v.discount_type === 'percentage' ? `${v.value}%` : rupiah(v.value);
}

/** The discount in words for a table cell: "20% up to Rp 15.000", "Rp 10.000". */
export function discountText(v: Pick<Voucher, 'discount_type' | 'value' | 'max_discount'>, t: T): string {
  if (v.discount_type === 'amount') return rupiah(v.value);
  return v.max_discount > 0 ? t('vouchers.discountUpTo', { value: `${v.value}%`, max: rupiah(v.max_discount) }) : `${v.value}%`;
}

/** How many have claimed it, against how many may: "12 / 50", "12 / ∞". */
export function claimsText(v: Pick<Voucher, 'type' | 'claims_count' | 'max_claims'>): string {
  if (v.type === 'public') return '–';
  return `${v.claims_count} / ${v.max_claims > 0 ? v.max_claims : '∞'}`;
}

/** A readable code for a coded voucher: letters and digits that cannot be mistaken for each other (no 0/O, 1/I/L). */
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export function randomCode(length = 8): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => CODE_CHARS[b % CODE_CHARS.length]).join('');
}

/** Whether `#RRGGBB`: what the stub is painted with is never anything else. */
export const isHexColor = (v: string) => /^#[0-9A-Fa-f]{6}$/.test(v);
