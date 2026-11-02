import { Link } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { Power, PowerOff } from 'lucide-react';
import { actionsColumn, Badge, CatalogIcon, RowActions, rupiah } from '@wuzz/web-ui';
import type { Service, ServiceCategory } from '@/core/api';
import { linkAction } from '@/core/utils/link-action';
import { useTranslation } from '@/core/utils/i18n';

/** The columns of the services table: id, icon and name (opens the service), category, unit, price, groups, status and the row actions (`onDelete` gives every row its bin). */
export function useServicesColumns(categories: ServiceCategory[] | undefined, { onDelete, onToggle, busy = false }: { onDelete?: (s: Service) => void; onToggle?: (s: Service) => void; busy?: boolean } = {}) {
  const { t } = useTranslation();
  return useMemo<ColumnDef<Service>[]>(
    () => [
      { accessorKey: 'id', header: t('services.columns.id'), cell: ({ row }) => <span className="text-muted-foreground">{row.original.id}</span> },
      {
        accessorKey: 'name',
        header: t('services.columns.name'),
        cell: ({ row: { original: s } }) => (
          <span className="flex items-center gap-2">
            <CatalogIcon name={s.icon} size={44} className="size-5" />
            <Link to="/services/$id" params={{ id: String(s.id) }} className="font-medium hover:underline">{s.name}</Link>
          </span>
        ),
      },
      {
        accessorKey: 'category_id',
        header: t('services.columns.category'),
        cell: ({ row: { original: s } }) => {
          const c = categories?.find((x) => x.id === s.category_id);
          return c ? (
            <span className="flex items-center gap-1.5 text-sm">
              <CatalogIcon name={c.icon} className="size-4 text-muted-foreground" />
              {c.name}
            </span>
          ) : (
            <span className="text-muted-foreground">–</span>
          );
        },
      },
      { accessorKey: 'unit', header: t('services.columns.unit'), cell: ({ row }) => t(`unit.${row.original.unit}`) },
      { accessorKey: 'price', header: t('services.form.columns.priceBefore'), meta: { className: 'whitespace-nowrap tabular-nums' }, cell: ({ row }) => rupiah(row.original.price_before_tax) },
      {
        id: 'price_after_tax',
        enableSorting: false,
        header: t('services.form.columns.priceAfter'),
        meta: { className: 'whitespace-nowrap tabular-nums' },
        cell: ({ row: { original: s } }) => (
          <span className="flex items-center gap-2">
            {s.tax_type === 'none' && s.discount_type === 'none' ? <span className="text-muted-foreground">{rupiah(s.price_after_tax)}</span> : rupiah(s.price_after_tax)}
            {s.discount_type !== 'none' && (
              <Badge tone="good" size="xs">{s.discount_type === 'percent' ? `−${s.discount_value / 100}%` : `−${rupiah(s.discount_amount)}`}</Badge>
            )}
            {s.tax_type !== 'none' && <Badge tone="info" size="xs">{t('services.form.taxPpn', { percent: s.tax_rate_bps / 100 })}</Badge>}
          </span>
        ),
      },
      {
        id: 'options',
        enableSorting: false,
        header: t('services.columns.options'),
        meta: { className: 'text-xs whitespace-nowrap text-muted-foreground' },
        cell: ({ row: { original: s } }) =>
          s.variant_groups.length === 0 && s.modifier_groups.length === 0
            ? '–'
            : [
                s.variant_groups.length ? t('services.variantCount', { count: s.variant_groups.length }) : '',
                s.modifier_groups.length ? t('services.groupCount', { count: s.modifier_groups.length }) : '',
              ]
                .filter(Boolean)
                .join(' · '),
      },
      {
        accessorKey: 'active',
        header: t('services.columns.status'),
        cell: ({ row: { original: s } }) => <Badge tone={s.active ? 'good' : 'warn'}>{s.active ? t('status.record.active') : t('status.record.inactive')}</Badge>,
      },
      actionsColumn<Service>({
        header: t('common.actions'),
        cell: (s) => (
          <RowActions
            view={{ label: t('common.viewName', { name: s.name }), link: linkAction('/services/$id', { id: String(s.id) }) }}
            extra={onToggle ? [{ label: t(`toggle.${s.active ? 'off' : 'on'}Name`, { name: s.name }), icon: s.active ? <PowerOff className="size-4" aria-hidden /> : <Power className="size-4" aria-hidden />, disabled: busy, onClick: () => onToggle(s) }] : []}
            edit={{ label: t('common.editName', { name: s.name }), link: linkAction('/services/$id/edit', { id: String(s.id) }) }}
            remove={onDelete && { label: t('common.deleteName', { name: s.name }), disabled: busy, onClick: () => onDelete(s) }}
          />
        ),
      }),
    ],
    [t, categories, onDelete, onToggle, busy],
  );
}
