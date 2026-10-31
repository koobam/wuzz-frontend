import { Link } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { Badge } from '@wuzz/web-ui';
import { skippedTotal, type Injection } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';

const moment = (iso: string, language: string) => new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeStyle: 'short', hour12: false }).format(new Date(iso));

/** The columns of the history of sends: when, which voucher, who sent it, how many it was aimed at, how many got it, and the ones skipped with why. */
export function useInjectionsColumns() {
  const { t, i18n } = useTranslation();
  return useMemo<ColumnDef<Injection>[]>(
    () => [
      { accessorKey: 'id', header: t('vouchers.history.id'), cell: ({ row }) => <span className="text-muted-foreground">{row.original.id}</span> },
      { id: 'at', enableSorting: false, header: t('vouchers.history.at'), meta: { className: 'whitespace-nowrap text-sm' }, cell: ({ row }) => moment(row.original.created_at, i18n.language) },
      {
        id: 'voucher',
        enableSorting: false,
        header: t('vouchers.history.voucher'),
        cell: ({ row: { original: i } }) => <Link to="/vouchers/$id" params={{ id: String(i.voucher_id) }} className="line-clamp-2 max-w-52 font-medium hover:underline">{i.voucher_title || `#${i.voucher_id}`}</Link>,
      },
      { id: 'actor', enableSorting: false, header: t('vouchers.history.actor'), cell: ({ row }) => row.original.actor_name || <span className="text-muted-foreground">–</span> },
      { id: 'target', enableSorting: false, header: t('vouchers.history.targeted'), meta: { className: 'tabular-nums' }, cell: ({ row }) => row.original.target_count },
      { id: 'injected', enableSorting: false, header: t('vouchers.history.injected'), meta: { className: 'tabular-nums' }, cell: ({ row }) => <Badge tone="good" size="xs">{row.original.injected_count}</Badge> },
      {
        id: 'skipped',
        enableSorting: false,
        header: t('vouchers.history.skipped'),
        cell: ({ row: { original: i } }) =>
          skippedTotal(i) === 0 ? (
            <span className="text-muted-foreground">0</span>
          ) : (
            <span className="flex flex-wrap items-center gap-1">
              {Object.entries(i.skipped).filter(([, n]) => n > 0).map(([reason, n]) => (
                <Badge key={reason} tone="warn" size="xs">{t(`vouchers.skipReason.${reason}`, { defaultValue: reason })}: {n}</Badge>
              ))}
            </span>
          ),
      },
    ],
    [t, i18n.language],
  );
}
