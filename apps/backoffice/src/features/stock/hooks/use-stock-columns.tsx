import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { ArrowLeftRight, ClipboardCheck, Gauge, PackageMinus, PackagePlus } from 'lucide-react';
import { actionsColumn, Badge, formatDecimal, roundTo, RowActions, rupiah } from '@wuzz/web-ui';
import type { Outlet, StockRow } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import type { StockAction } from '../utils/stock-dialog.schema';

const STOCK_ICONS = { receipt: PackagePlus, waste: PackageMinus, adjustment: ClipboardCheck, transfer: ArrowLeftRight, min: Gauge } as const;

/** The columns of the stock table. The outlet is only a column when the list spans several of them (`outlet` <= 0). */
export function useStockColumns({ outlet, outlets, onAct }: { outlet: number; outlets: Outlet[] | undefined; onAct: (action: StockAction, row: StockRow) => void }) {
  const { t, i18n } = useTranslation();
  const outletName = (id: number) => outlets?.find((o) => o.id === id)?.name ?? `#${id}`;
  const qty = (r: StockRow) => `${formatDecimal(r.qty, i18n.language)} ${t(`materials.unit.${r.unit}`)}`;

  return useMemo<ColumnDef<StockRow>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('stock.columns.name'),
        cell: ({ row: { original: r } }) => (
          <>
            <div className="font-medium">{r.name}</div>
            <div className="font-mono text-xs text-muted-foreground">{r.sku}</div>
          </>
        ),
      },
      ...(outlet <= 0 ? [{ id: 'outlet', enableSorting: false, header: t('stock.columns.outlet'), meta: { className: 'whitespace-nowrap' }, cell: ({ row }: { row: { original: StockRow } }) => outletName(row.original.outlet_id) } as ColumnDef<StockRow>] : []),
      {
        accessorKey: 'qty',
        header: t('stock.columns.qty'),
        meta: { className: 'whitespace-nowrap tabular-nums' },
        cell: ({ row: { original: r } }) => (
          <>
            <span className="flex items-center gap-2 font-medium">
              {qty(r)}
              {r.qty.startsWith('-') ? <Badge tone="bad">{t('stock.negative')}</Badge> : r.low ? <Badge tone="warn">{t('stock.low')}</Badge> : null}
            </span>
            {Number(r.min_qty) > 0 && <div className="text-xs text-muted-foreground">{t('stock.minimum', { qty: qty({ ...r, qty: r.min_qty }) })}</div>}
          </>
        ),
      },
      {
        accessorKey: 'value',
        header: t('stock.columns.value'),
        meta: { className: 'whitespace-nowrap tabular-nums' },
        cell: ({ row: { original: r } }) => (
          <>
            <div>{rupiah(r.value)}</div>
            <div className="text-xs text-muted-foreground">{t('stock.worth', { cost: formatDecimal(roundTo(r.avg_cost, 2), i18n.language), unit: t(`materials.unit.${r.unit}`) })}</div>
          </>
        ),
      },
      actionsColumn<StockRow>({
        header: t('common.actions'),
        cell: (r) => (
          <RowActions
            extra={(['receipt', 'waste', 'adjustment', 'transfer', 'min'] as const).map((a) => {
              const Icon = STOCK_ICONS[a];
              return { label: `${t(`stock.action.${a}`)}: ${r.name}`, icon: <Icon className="size-4" aria-hidden />, onClick: () => onAct(a, r) };
            })}
          />
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, i18n.language, outlets, outlet, onAct],
  );
}
