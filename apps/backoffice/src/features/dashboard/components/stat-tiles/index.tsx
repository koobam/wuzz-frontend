import { Ban, CheckCircle2, Clock, ShoppingCart } from 'lucide-react';
import { useTranslation } from '@/core/utils/i18n';
import type { summarize } from '../../utils/stats';
import { Tile } from '../tile';

/** Four numbers: all orders, the open ones, the fulfilled and the cancelled. */
export function StatTiles({ summary: s }: { summary: ReturnType<typeof summarize> }) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-4">
      <Tile highlight icon={ShoppingCart} label={t('dashboard.totalOrders')} value={s.total} note={s.loaded ? t('dashboard.newCount', { count: s.created }) : undefined} />
      <Tile icon={Clock} label={t('dashboard.openOrders')} value={s.open} note={t('dashboard.openNote')} />
      <Tile icon={CheckCircle2} label={t('dashboard.fulfilled')} value={s.loaded ? s.fulfilled : undefined} note={s.loaded ? t('dashboard.share', { percent: s.rate }) : undefined} />
      <Tile icon={Ban} label={t('dashboard.cancelled')} value={s.loaded ? s.cancelled : undefined} note={s.loaded ? t('dashboard.share', { percent: s.cancelledShare }) : undefined} />
    </div>
  );
}
