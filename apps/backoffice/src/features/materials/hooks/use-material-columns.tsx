import type { ColumnDef } from '@tanstack/react-table';
import { Link } from '@tanstack/react-router';
import { useMemo } from 'react';
import { Power, PowerOff } from 'lucide-react';
import { actionsColumn, Badge, formatDecimal, roundTo, RowActions, rupiah } from '@wuzz/web-ui';
import type { Material } from '@/core/api';
import { linkAction } from '@/core/utils/link-action';
import { useTranslation } from '@/core/utils/i18n';

/** The columns of the materials list: the material and its SKU, what a purchase costs (and the exact cost of one unit), where it is used, its status. */
export function useMaterialColumns({ busy, onDelete, onToggle }: { busy: boolean; onDelete: (m: Material) => void; onToggle?: (m: Material) => void }) {
  const { t, i18n } = useTranslation();
  return useMemo<ColumnDef<Material>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('materials.columns.name'),
        meta: { className: 'max-w-xs' },
        cell: ({ row: { original: m } }) => (
          <>
            <Link to="/materials/$id" params={{ id: String(m.id) }} className="font-medium hover:underline">{m.name}</Link>
            <div className="text-xs text-muted-foreground">
              <span className="font-mono">{m.sku}</span> · {t(`materials.category.${m.category}`)}
              {m.notes ? ` · ${m.notes}` : ''}
            </div>
          </>
        ),
      },
      {
        id: 'purchase',
        enableSorting: false,
        header: t('materials.columns.purchase'),
        meta: { className: 'whitespace-nowrap' },
        cell: ({ row: { original: m } }) => (
          <>
            <div>{rupiah(m.purchase_price)} {t('materials.for')} {formatDecimal(m.purchase_qty, i18n.language)} {t(`materials.unit.${m.unit}`)}</div>
            <div className="text-xs text-muted-foreground">≈ Rp {formatDecimal(roundTo(m.unit_cost, 2), i18n.language)} {t('materials.per')} {t(`materials.unit.${m.unit}`)}</div>
          </>
        ),
      },
      { id: 'usedIn', enableSorting: false, header: t('materials.columns.usedIn'), meta: { className: 'whitespace-nowrap text-sm' }, cell: ({ row }) => (row.original.used_in ? t('materials.bomLines', { count: row.original.used_in }) : <span className="text-muted-foreground">{t('materials.notUsed')}</span>) },
      {
        id: 'status',
        enableSorting: false,
        header: t('materials.columns.status'),
        cell: ({ row }) => <Badge tone={row.original.active ? 'good' : 'muted'}>{row.original.active ? t('materials.active') : t('materials.inactive')}</Badge>,
      },
      actionsColumn<Material>({
        header: t('common.actions'),
        cell: (m) => (
          <RowActions
            view={{ label: t('common.viewName', { name: m.name }), link: linkAction('/materials/$id', { id: String(m.id) }) }}
            extra={onToggle ? [{ label: t(`toggle.${m.active ? 'off' : 'on'}Name`, { name: m.name }), icon: m.active ? <PowerOff className="size-4" aria-hidden /> : <Power className="size-4" aria-hidden />, disabled: busy, onClick: () => onToggle(m) }] : []}
            edit={{ label: t('common.editName', { name: m.name }), link: linkAction('/materials/$id/edit', { id: String(m.id) }) }}
            remove={{ label: t('common.deleteName', { name: m.name }), disabled: busy, onClick: () => onDelete(m) }}
          />
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, i18n.language, busy, onToggle],
  );
}
