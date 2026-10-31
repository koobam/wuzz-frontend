import { rupiah, useConfirm } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';

/** The questions the till asks before it sends something to the server, worded the same everywhere. Each resolves to `true` when the cashier confirms. */
export function useConfirmAction() {
  const { t } = useTranslation();
  const confirm = useConfirm();

  return {
    placeOrder: (lines: number, total: number) =>
      confirm({
        title: t('confirm.order.place'),
        description: t('confirm.order.placeNote', { count: lines, total: rupiah(total) }),
        confirmLabel: t('newOrder.save'),
      }),
    /** Moving an order to `label`'s step (start, ready, pickedUp, cancel); cancelling is the destructive one. */
    moveOrder: (code: string, label: string) =>
      confirm({
        title: t(`confirm.order.${label}`, { code }),
        description: label === 'cancel' ? t('confirm.order.cancelNote') : t('confirm.order.moveNote'),
        confirmLabel: label === 'cancel' ? t('confirm.order.cancelLabel') : t(`orders.action.${label}`),
        destructive: label === 'cancel',
      }),
    stock: (action: 'receipt' | 'waste', name: string) =>
      confirm({ title: t(`confirm.stock.${action}`, { name }), description: t('confirm.stock.note'), confirmLabel: t('common.confirm'), destructive: action === 'waste' }),
  };
}
