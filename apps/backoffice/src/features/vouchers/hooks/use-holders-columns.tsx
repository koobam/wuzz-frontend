import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { Badge } from '@wuzz/web-ui';
import type { VoucherHolder } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';

const moment = (iso: string, language: string) => new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeStyle: 'short', hour12: false }).format(new Date(iso));

/** The columns of a voucher's holders: who, their phone, when they got it, how often they used it, what is left and when their copy ends. */
export function useHoldersColumns(usageLimit: number) {
  const { t, i18n } = useTranslation();
  return useMemo<ColumnDef<VoucherHolder>[]>(
    () => [
      { id: 'name', header: t('vouchers.holders.name'), enableSorting: false, cell: ({ row }) => <span className="font-medium">{row.original.customer_name || '–'}</span> },
      { id: 'phone', header: t('vouchers.holders.phone'), enableSorting: false, cell: ({ row }) => <Badge copy={row.original.customer_phone} tone="muted" size="sm">{row.original.customer_phone}</Badge> },
      { accessorKey: 'granted_at', header: t('vouchers.holders.claimedAt'), meta: { className: 'whitespace-nowrap text-sm' }, cell: ({ row }) => moment(row.original.granted_at, i18n.language) },
      {
        id: 'source',
        header: t('vouchers.holders.source'),
        enableSorting: false,
        cell: ({ row: { original: h } }) => (
          <span className="flex flex-col items-start gap-0.5">
            <Badge tone={h.source === 'claim' ? 'info' : 'muted'} size="xs">{t(`vouchers.holders.${h.source}`)}</Badge>
            {h.source === 'inject' && h.granted_by && <span className="text-xs text-muted-foreground">{h.granted_by}</span>}
          </span>
        ),
      },
      { id: 'used', header: t('vouchers.holders.used'), enableSorting: false, meta: { className: 'tabular-nums' }, cell: ({ row }) => Math.max(0, usageLimit - row.original.uses_remaining) },
      {
        id: 'remaining',
        header: t('vouchers.holders.remaining'),
        enableSorting: false,
        cell: ({ row: { original: h } }) => <Badge tone={h.uses_remaining > 0 ? 'good' : 'muted'} size="xs">{h.uses_remaining > 0 ? t('vouchers.holders.left', { count: h.uses_remaining }) : t('vouchers.holders.spent')}</Badge>,
      },
      { id: 'expires_at', header: t('vouchers.holders.expires'), enableSorting: false, meta: { className: 'whitespace-nowrap text-sm' }, cell: ({ row }) => (row.original.expires_at ? moment(row.original.expires_at, i18n.language) : <span className="text-muted-foreground">–</span>) },
    ],
    [t, i18n.language, usageLimit],
  );
}
