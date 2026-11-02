import { BadgeLegend } from '@wuzz/web-ui';
import type { OrderStatus } from '@/core/pos/types';
import { useTranslation } from '@/core/utils/i18n';
import { statusTone } from '../../utils/status';

const STATUSES: OrderStatus[] = ['created', 'processing', 'ready', 'fulfilled', 'cancelled'];

/** The key to the status badges of the orders table: every status, and what it means. */
export function OrdersLegend() {
  const { t } = useTranslation();
  return <BadgeLegend items={STATUSES.map((s) => ({ tone: statusTone(s), label: t(`orders.status.${s}`), description: t(`orders.statusHelp.${s}`) }))} />;
}
