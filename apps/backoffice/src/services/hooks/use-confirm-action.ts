import { useConfirm } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';

export type ConfirmKind = 'service' | 'variant' | 'modifier' | 'material' | 'outlet' | 'recipe' | 'banner' | 'voucher';

/**
 * The questions asked before something is created, changed or deleted, worded the same on every page. Each resolves to
 * `true` when the person confirms; a controller writes `if (!(await ask.save('outlet', name))) return;` and goes on.
 */
export function useConfirmAction() {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const kindName = (kind: ConfirmKind) => t(`confirm.kind.${kind}`);

  return {
    create: (kind: ConfirmKind, name: string) =>
      confirm({ title: t('confirm.create', { kind: kindName(kind), name }), description: t('confirm.createNote'), confirmLabel: t('common.create') }),
    save: (kind: ConfirmKind, name: string) =>
      confirm({ title: t('confirm.save', { kind: kindName(kind), name }), description: t('confirm.saveNote'), confirmLabel: t('common.save') }),
    /** `usedBy`: how many services use it, when that matters to the answer. */
    remove: (kind: ConfirmKind, name: string, usedBy = 0) =>
      confirm({
        title: t('confirm.delete', { kind: kindName(kind), name }),
        description: usedBy > 0 ? t('confirm.deleteUsed', { count: usedBy }) : t(`confirm.deleteNoteFor.${kind}`, { defaultValue: t('confirm.deleteNote') }),
        confirmLabel: t('common.delete'),
        destructive: true,
      }),
    /** Turning a record on (`to` true) or off: the question says what that does. */
    toggle: (kind: 'service' | 'outlet' | 'material' | 'banner' | 'voucher', name: string, to: boolean) =>
      confirm({
        title: t(to ? 'toggle.titleOn' : 'toggle.titleOff', { kind: kindName(kind), name }),
        description: t(`toggle.note.${kind}.${to ? 'on' : 'off'}`),
        confirmLabel: t(to ? 'toggle.on' : 'toggle.off'),
      }),
    /** Sending a voucher into the wallets of `count` customers: it cannot be taken back from them. */
    sendVoucher: (title: string, count: number) =>
      confirm({ title: t('confirm.sendVoucher', { title, count }), description: t('confirm.sendVoucherNote'), confirmLabel: t('vouchers.send.confirm') }),
    /** Saving a new order for the banners of the carousel. */
    reorder: (count: number) =>
      confirm({ title: t('confirm.reorder', { count }), description: t('confirm.reorderNote'), confirmLabel: t('common.save') }),
    /** Create when the record is new, save when it already exists. */
    submit: (kind: ConfirmKind, name: string, existing: boolean) => (existing ? ask(kind, name, 'save') : ask(kind, name, 'create')),
    /** Moving an order to `to`; cancelling is the destructive one. */
    moveOrder: (code: string, to: 'processing' | 'ready' | 'fulfilled' | 'cancelled') =>
      confirm({
        title: t(`confirm.order.${to}`, { code }),
        description: to === 'cancelled' ? t('confirm.order.cancelNote') : t('confirm.order.note'),
        confirmLabel: to === 'cancelled' ? t('confirm.order.cancelLabel') : t(`orders.action.${to}`),
        destructive: to === 'cancelled',
      }),
    /** Blocking a customer from signing in (`banned`) or letting them back (`active`). */
    userStatus: (name: string, to: 'banned' | 'active') =>
      confirm({
        title: t(to === 'banned' ? 'confirm.user.ban' : 'confirm.user.unban', { name }),
        description: t(to === 'banned' ? 'confirm.user.banNote' : 'confirm.user.unbanNote'),
        confirmLabel: t(to === 'banned' ? 'users.ban' : 'users.unban'),
        destructive: to === 'banned',
      }),
    /** One stock action on a material; it is written to the ledger and cannot be edited. */
    stock: (action: 'receipt' | 'waste' | 'adjustment' | 'transfer' | 'min', name: string) =>
      confirm({ title: t(`confirm.stock.${action}`, { name }), description: t('confirm.stock.note'), confirmLabel: t('common.confirm'), destructive: action === 'waste' }),
  };

  function ask(kind: ConfirmKind, name: string, which: 'create' | 'save') {
    return confirm({
      title: t(`confirm.${which}`, { kind: kindName(kind), name }),
      description: t(`confirm.${which}Note`),
      confirmLabel: t(which === 'create' ? 'common.create' : 'common.save'),
    });
  }
}
