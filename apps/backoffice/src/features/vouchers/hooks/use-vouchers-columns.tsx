import { Link } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { Power, PowerOff } from 'lucide-react';
import { useMemo } from 'react';
import { actionsColumn, Badge, RowActions, rupiah } from '@wuzz/web-ui';
import type { Voucher } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { linkAction } from '@/core/utils/link-action';
import { claimsText, discountText, isHexColor, liveState, LIVE_TONE, shortMoment, zoneName } from '../utils/voucher-display';

/** The columns of the vouchers table: id, colour, title and code (opens the voucher), the discount, the least spend, claims, the window, the outlets, status and the row actions. */
export function useVouchersColumns({ onDelete, onToggle, busy = false }: { onDelete?: (v: Voucher) => void; onToggle?: (v: Voucher) => void; busy?: boolean } = {}) {
  const { t, i18n } = useTranslation();
  return useMemo<ColumnDef<Voucher>[]>(
    () => [
      { accessorKey: 'id', header: t('vouchers.columns.id'), cell: ({ row }) => <span className="text-muted-foreground">{row.original.id}</span> },
      {
        accessorKey: 'title',
        header: t('vouchers.columns.voucher'),
        cell: ({ row: { original: v } }) => (
          <span className="flex min-w-0 items-center gap-3">
            <span className="size-9 shrink-0 rounded-xl border border-border" style={{ backgroundColor: isHexColor(v.color) ? v.color : undefined }} aria-hidden />
            <span className="flex min-w-0 flex-col items-start gap-1">
              <Link to="/vouchers/$id" params={{ id: String(v.id) }} className="line-clamp-2 max-w-48 min-w-0 font-medium hover:underline">{v.title}</Link>
              {v.type === 'code' ? <Badge copy={v.code} tone="info" size="2xs">{v.code}</Badge> : <Badge tone="muted" size="2xs">{t('vouchers.type.public')}</Badge>}
            </span>
          </span>
        ),
      },
      { accessorKey: 'value', header: t('vouchers.columns.discount'), meta: { className: 'text-sm' }, cell: ({ row }) => <span className="block max-w-44">{discountText(row.original, t)}</span> },
      { accessorKey: 'min_spend', header: t('vouchers.columns.minSpend'), meta: { className: 'whitespace-nowrap tabular-nums' }, cell: ({ row }) => (row.original.min_spend > 0 ? rupiah(row.original.min_spend) : <span className="text-muted-foreground">–</span>) },
      { id: 'claims', enableSorting: false, header: t('vouchers.columns.claims'), meta: { className: 'whitespace-nowrap tabular-nums' }, cell: ({ row }) => claimsText(row.original) },
      {
        accessorKey: 'starts_at',
        header: t('vouchers.columns.window', { zone: zoneName() }),
        meta: { className: 'text-sm' },
        cell: ({ row: { original: v } }) =>
          !v.starts_at && !v.ends_at ? (
            <span className="text-muted-foreground">{t('banners.schedule.always')}</span>
          ) : (
            <span className="block space-y-0.5 text-xs whitespace-nowrap">
              <span className="block">{v.starts_at ? shortMoment(v.starts_at, i18n.language) : t('banners.schedule.now')}</span>
              <span className="block text-muted-foreground">→ {v.ends_at ? shortMoment(v.ends_at, i18n.language) : t('banners.schedule.noEnd')}</span>
            </span>
          ),
      },
      {
        id: 'outlets',
        enableSorting: false,
        header: t('vouchers.columns.outlets'),
        cell: ({ row: { original: v } }) =>
          v.outlets.length === 0 ? (
            <span className="text-muted-foreground">{t('banners.outlets.all')}</span>
          ) : (
            <span className="block max-w-36 text-sm" title={v.outlets.map((o) => o.name).join(', ')}>
              {v.outlets.slice(0, 2).map((o) => o.name).join(', ')}
              {v.outlets.length > 2 && <span className="text-muted-foreground"> {t('banners.outlets.more', { count: v.outlets.length - 2 })}</span>}
            </span>
          ),
      },
      {
        accessorKey: 'status',
        header: t('vouchers.columns.status'),
        cell: ({ row: { original: v } }) => {
          const state = liveState(v);
          return (
            <span className="flex flex-col items-start gap-1">
              <Badge tone={v.status === 'active' ? 'good' : 'warn'}>{v.status === 'active' ? t('status.record.active') : t('status.record.inactive')}</Badge>
              <Badge tone={LIVE_TONE[state]}>{t(`vouchers.live.${state}`)}</Badge>
            </span>
          );
        },
      },
      actionsColumn<Voucher>({
        header: t('common.actions'),
        cell: (v) => (
          <RowActions
            view={{ label: t('common.viewName', { name: v.title }), link: linkAction('/vouchers/$id', { id: String(v.id) }) }}
            extra={onToggle ? [{ label: t(`toggle.${v.status === 'active' ? 'off' : 'on'}Name`, { name: v.title }), icon: v.status === 'active' ? <PowerOff className="size-4" aria-hidden /> : <Power className="size-4" aria-hidden />, disabled: busy, onClick: () => onToggle(v) }] : []}
            edit={{ label: t('common.editName', { name: v.title }), link: linkAction('/vouchers/$id/edit', { id: String(v.id) }) }}
            remove={onDelete && { label: t('common.deleteName', { name: v.title }), disabled: busy, onClick: () => onDelete(v) }}
          />
        ),
      }),
    ],
    [t, i18n.language, onDelete, onToggle, busy],
  );
}
