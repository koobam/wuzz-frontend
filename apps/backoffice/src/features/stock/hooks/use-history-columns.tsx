import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { Badge, formatDecimal, rupiah } from '@wuzz/web-ui';
import type { Outlet, StockMovement } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { kindTone } from '../utils/kind';
import { useDateFormat } from '@/services/hooks/use-date-format';


/** The columns of the stock ledger. The outlet shows under the material only when the list spans several outlets (`outlet` is 0). */
export function useHistoryColumns({ outlet, outlets }: { outlet: number; outlets: Outlet[] | undefined }) {
  const { t, i18n } = useTranslation();
  const date = useDateFormat();
  const outletName = (id: number) => outlets?.find((o) => o.id === id)?.name ?? `#${id}`;
  const dec = (s: string) => formatDecimal(s, i18n.language);
  const signed = (s: string) => (s.startsWith('-') ? dec(s) : `+${dec(s)}`);

  return useMemo<ColumnDef<StockMovement>[]>(
    () => [
      {
        accessorKey: 'created_at',
        header: t('history.columns.time'),
        meta: { className: 'whitespace-nowrap' },
        cell: ({ row: { original: m } }) => (
          <>
            <div className="text-sm">{date(m.created_at)}</div>
            <div className="text-xs text-muted-foreground">{m.kind.startsWith('consumption') ? t('history.bySystem') : m.created_by ? t('history.by', { name: m.created_by.replace(/\s*\(.*\)$/, '') }) : ''}</div>
          </>
        ),
      },
      {
        id: 'material',
        enableSorting: false,
        header: t('history.columns.material'),
        cell: ({ row: { original: m } }) => (
          <>
            <div className="font-medium">{m.name}</div>
            <div className="text-xs text-muted-foreground">
              <span className="font-mono">{m.sku}</span>
              {!outlet && ` · ${outletName(m.outlet_id)}`}
            </div>
          </>
        ),
      },
      {
        id: 'event',
        enableSorting: false,
        header: t('history.columns.event'),
        meta: { className: 'max-w-sm' },
        cell: ({ row: { original: m } }) => {
          const detail = [m.reason && t(`stock.reason.${m.reason}`, { defaultValue: m.reason }), m.ref_type === 'order' && t('history.order', { id: m.ref_id.slice(0, 8) }), m.doc_no, m.supplier, m.note].filter(Boolean).join(' · ');
          return (
            <>
              <Badge tone={kindTone(m.kind)}>{t(`history.kind.${m.kind}`)}</Badge>
              {detail && <div className="mt-1 text-xs text-muted-foreground">{detail}</div>}
            </>
          );
        },
      },
      {
        id: 'change',
        enableSorting: false,
        header: t('history.columns.change'),
        meta: { className: 'whitespace-nowrap tabular-nums' },
        cell: ({ row: { original: m } }) => (
          <>
            <div className="font-medium">{signed(m.qty_delta)} {t(`materials.unit.${m.unit}`)}</div>
            <div className="text-xs text-muted-foreground">{m.value_delta < 0 ? `-${rupiah(-m.value_delta)}` : `+${rupiah(m.value_delta)}`}</div>
          </>
        ),
      },
      {
        id: 'balance',
        enableSorting: false,
        header: t('history.columns.balance'),
        meta: { className: 'whitespace-nowrap tabular-nums' },
        cell: ({ row: { original: m } }) => (
          <>
            <div>{dec(m.balance_qty)} {t(`materials.unit.${m.unit}`)}</div>
            <div className="text-xs text-muted-foreground">{rupiah(m.balance_value)}</div>
          </>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, date, i18n.language, outlets, outlet],
  );
}
