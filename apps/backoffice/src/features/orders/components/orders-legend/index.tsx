import { BadgeLegend } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import { ORDER_STATUSES, tone } from '../../utils/status';

/** The key to the status badges of an orders table: every status, and what it means. */
export function OrdersLegend() {
  const { t } = useTranslation();
  return <BadgeLegend items={ORDER_STATUSES.map((s) => ({ tone: tone(s), label: t(`status.order.${s}`), description: t(`status.help.order.${s}`) }))} />;
}
