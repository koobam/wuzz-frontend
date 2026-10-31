import { roundTo } from '@wuzz/web-ui';

/** `a - b` for a whole-rupiah price and a decimal-string cost, and that as a percentage of the price: exact on the digits (micro-rupiah), for the overview only. */
export function difference(price: number, cost: string) {
  const [i = '0', f = ''] = cost.split('.');
  const micro = BigInt(i + f.padEnd(6, '0').slice(0, 6));
  const diff = BigInt(price) * 1_000_000n - micro;
  // A micro-unit integer as a 6-decimal string.
  const text = (n: bigint) => {
    const digits = (n < 0n ? -n : n).toString().padStart(7, '0');
    return `${n < 0n ? '-' : ''}${digits.slice(0, -6)}.${digits.slice(-6)}`;
  };
  const profit = roundTo(text(diff), 2);
  const pct = price > 0 ? roundTo(text((diff * 100n) / BigInt(price)), 1) : '0';
  return { profit, pct };
}
