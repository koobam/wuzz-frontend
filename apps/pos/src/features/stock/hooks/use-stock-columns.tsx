import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { PackageMinus, PackagePlus } from 'lucide-react';
import { actionsColumn, Badge, formatDecimal, RowActions } from '@wuzz/web-ui';
import type { StockKind, StockMovement, StockRow } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { kindTone } from '../utils/kind';

export type StockAction = 'waste' | 'receipt';

/** The columns of the outlet's material stock, with the buttons that open the waste and receipt sheets. */
export function useStockColumns({ online, onAct }: { online: boolean; onAct: (action: StockAction, row: StockRow) => void }) {
  const { t, i18n } = useTranslation();
  return useMemo<ColumnDef<StockRow>[]>(
    () => {
      const dec = (s: string) => formatDecimal(s, i18n.language);
      return [
        { id: 'sku', header: t('stock.columns.sku'), meta: { className: 'whitespace-nowrap font-mono text-xs' }, cell: ({ row }) => row.original.sku },
        { id: 'name', header: t('stock.columns.name'), cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
        {
          id: 'qty',
          header: t('stock.columns.qty'),
          meta: { className: 'whitespace-nowrap tabular-nums' },
          cell: ({ row: { original: r } }) => (
            <span className="flex items-center gap-2">
              {dec(r.qty)} {t(`stock.unit.${r.unit}`)}
              {r.qty.startsWith('-') ? <Badge tone="bad">{t('stock.negative')}</Badge> : r.low ? <Badge tone="warn">{t('stock.low')}</Badge> : null}
            </span>
          ),
        },
        { id: 'min', header: t('stock.columns.min'), meta: { className: 'whitespace-nowrap text-xs tabular-nums' }, cell: ({ row: { original: r } }) => (Number(r.min_qty) > 0 ? `${dec(r.min_qty)} ${t(`stock.unit.${r.unit}`)}` : '–') },
        actionsColumn<StockRow>({
          header: t('common.actions'),
          cell: (r) => (
            <RowActions
              extra={(['waste', 'receipt'] as const).map((a) => ({
                label: online ? `${t(`stock.action.${a}`)}: ${r.name}` : `${t(`stock.action.${a}`)}: ${t('stock.needsConnection')}`,
                icon: a === 'waste' ? <PackageMinus className="size-4" aria-hidden /> : <PackagePlus className="size-4" aria-hidden />,
                disabled: !online,
                onClick: () => onAct(a, r),
              }))}
            />
          ),
        }),
      ];
    },
    [t, i18n.language, online, onAct],
  );
}

/** The columns of the history of stock movements. */
export function useMovementColumns() {
  const { t, i18n } = useTranslation();
  return useMemo<ColumnDef<StockMovement>[]>(
    () => {
      const dec = (s: string) => formatDecimal(s, i18n.language);
      const date = (iso: string) => new Date(iso).toLocaleString(i18n.language, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
      return [
        { id: 'time', header: t('stock.columns.time'), meta: { className: 'whitespace-nowrap text-xs' }, cell: ({ row }) => date(row.original.created_at) },
        { id: 'name', header: t('stock.columns.name'), cell: ({ row: { original: m } }) => (<><div className="font-medium">{m.name}</div><div className="font-mono text-xs text-muted-foreground">{m.sku}</div></>) },
        { id: 'kind', header: t('stock.columns.kind'), cell: ({ row: { original: m } }) => <Badge tone={kindTone(m.kind as StockKind)}>{t(`stock.kind.${m.kind}`)}</Badge> },
        { id: 'reason', header: t('stock.columns.reason'), meta: { className: 'text-xs' }, cell: ({ row: { original: m } }) => (m.reason ? t(`stock.reason.${m.reason}`, { defaultValue: m.reason }) : '–') },
        { id: 'qty', header: t('stock.columns.qtyDelta'), meta: { className: 'whitespace-nowrap tabular-nums' }, cell: ({ row: { original: m } }) => `${m.qty_delta.startsWith('-') ? '' : '+'}${dec(m.qty_delta)} ${t(`stock.unit.${m.unit}`)}` },
        { id: 'balance', header: t('stock.columns.balance'), meta: { className: 'whitespace-nowrap text-xs tabular-nums' }, cell: ({ row: { original: m } }) => `${dec(m.balance_qty)} ${t(`stock.unit.${m.unit}`)}` },
        { id: 'note', header: t('stock.columns.note'), meta: { className: 'max-w-xs text-xs text-muted-foreground' }, cell: ({ row }) => row.original.note || '–' },
        { id: 'by', header: t('stock.columns.by'), meta: { className: 'whitespace-nowrap text-xs' }, cell: ({ row }) => row.original.created_by || '–' },
      ];
    },
    [t, i18n.language],
  );
}
