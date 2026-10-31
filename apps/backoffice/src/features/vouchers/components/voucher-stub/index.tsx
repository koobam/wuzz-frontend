import { Ticket } from 'lucide-react';
import { rupiah } from '@wuzz/web-ui';
import type { Voucher } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { discountFigure, isHexColor } from '../../utils/voucher-display';

type Stub = Pick<Voucher, 'title' | 'color' | 'discount_type' | 'value' | 'min_spend' | 'code' | 'type'>;

/**
 * The coupon as the customer's wallet draws it, flat: the figure on a coloured stub, a dashed tear line, then the title, the
 * least spend and the code. The colour is checked as `#RRGGBB` before it is painted.
 */
export function VoucherStub({ voucher, className = '' }: { voucher: Stub; className?: string }) {
  const { t } = useTranslation();
  const color = isHexColor(voucher.color) ? voucher.color : '#9CA3AF';
  const hasFigure = voucher.value > 0;
  return (
    <div className={`flex min-h-24 overflow-hidden rounded-2xl border border-border bg-card ${className}`}>
      <div className="flex w-28 shrink-0 flex-col items-center justify-center gap-1 px-2 py-3 text-center text-white" style={{ backgroundColor: color }}>
        <Ticket className="size-4 opacity-80" aria-hidden />
        <span className="text-lg leading-tight font-bold break-words">{hasFigure ? discountFigure(voucher) : '–'}</span>
        <span className="text-[10px] tracking-wide uppercase opacity-90">{t('vouchers.stub.off')}</span>
      </div>
      <div className="w-0 shrink-0 self-stretch border-l-2 border-dashed border-border" aria-hidden />
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-4 py-3">
        <p className="line-clamp-2 text-sm font-semibold">{voucher.title.trim() || t('vouchers.stub.untitled')}</p>
        <p className="text-xs text-muted-foreground">{voucher.min_spend > 0 ? t('vouchers.stub.minSpend', { amount: rupiah(voucher.min_spend) }) : t('vouchers.stub.noMinSpend')}</p>
        {voucher.type === 'code' && voucher.code && <p className="font-mono text-xs tracking-wider">{voucher.code}</p>}
      </div>
    </div>
  );
}
