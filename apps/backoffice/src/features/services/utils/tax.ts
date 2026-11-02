import type { DiscountType } from '@/core/api';

/** Rounds a ratio of integers once, half away from zero (the server's rule for money). */
const roundDiv = (numerator: number, denominator: number) => Math.floor((numerator + denominator / 2) / denominator);

/**
 * What the form shows while a price is typed. It is the server's rule, in integer arithmetic, each step rounded once, half
 * away from zero: discount first (a fixed amount, or base x basis points / 10 000, never more than the price), then the tax
 * on what is left. The preview and the saved service agree; the saved figures are always the server's.
 */
export function discountOf(base: number, type: DiscountType, value: number) {
  if (type === 'value') return Math.min(value, base);
  if (type === 'percent') return Math.min(roundDiv(base * value, 10_000), base);
  return 0;
}
export const taxOf = (priceAfterDiscount: number, rateBps: number) => roundDiv(priceAfterDiscount * rateBps, 10_000);

export function priceBreakdown(base: number, discountType: DiscountType, discountValue: number, rateBps: number) {
  const discount = discountOf(base, discountType, discountValue);
  const afterDiscount = base - discount;
  const tax = taxOf(afterDiscount, rateBps);
  return { discount, afterDiscount, tax, final: afterDiscount + tax };
}
