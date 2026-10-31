import { Link } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { Power, PowerOff } from 'lucide-react';
import { actionsColumn, Badge, RowActions, ZoomableImage } from '@wuzz/web-ui';
import type { Outlet } from '@/core/api';
import { linkAction } from '@/core/utils/link-action';
import { useTranslation } from '@/core/utils/i18n';
import { inZone, orderedWeek } from '../utils/hours';
import { isShownImage } from '../utils/outlet-form.schema';

/**
 * The columns of the outlets table: id, photo, name (opens the outlet), address, phone, status and the row actions. `onDelete`
 * gives every row its bin (the server refuses an outlet that still has staff, orders or stock).
 */
/** Whether today (a day of the week in the outlet's own zone) is a 24-hour day. */
const todayIs24h = (o: Outlet) => orderedWeek(o.hours)[inZone(o.timezone).weekday]?.open_24h === true;

export function useOutletsColumns({ onDelete, onToggle, busy = false }: { onDelete?: (o: Outlet) => void; onToggle?: (o: Outlet) => void; busy?: boolean } = {}) {
  const { t } = useTranslation();
  return useMemo<ColumnDef<Outlet>[]>(
    () => [
      { accessorKey: 'id', header: t('outlets.columns.id'), cell: ({ row }) => <span className="text-muted-foreground">{row.original.id}</span> },
      {
        id: 'image',
        enableSorting: false,
        header: t('outlets.columns.image'),
        cell: ({ row: { original: o } }) =>
          isShownImage(o.images[0] ?? '') ? (
            <ZoomableImage
              src={o.images[0]!}
              alt={o.name}
              images={o.images.filter(isShownImage).map((src, i) => ({ src, alt: `${o.name} ${i + 1}` }))}
              loading="lazy"
              wrapperClassName="rounded-lg"
              className="h-9 w-14 rounded-lg border border-border object-cover"
            />
          ) : null,
      },
      {
        accessorKey: 'name',
        header: t('outlets.columns.name'),
        cell: ({ row: { original: o } }) => (
          <Link to="/outlets/$id" params={{ id: String(o.id) }} className="font-medium hover:underline">{o.name}</Link>
        ),
      },
      { accessorKey: 'address', header: t('outlets.columns.address'), meta: { className: 'max-w-xs' }, cell: ({ row }) => row.original.address },
      { accessorKey: 'phone', header: t('outlets.columns.phone'), meta: { className: 'whitespace-nowrap' }, cell: ({ row }) => row.original.phone },
      {
        id: 'hours',
        enableSorting: false,
        header: t('outlets.hours.columnTitle'),
        meta: { className: 'whitespace-nowrap tabular-nums' },
        cell: ({ row: { original: o } }) => (
          <span className="flex items-center gap-2">
            {todayIs24h(o) ? (
              <span>{t('outlets.schedule.open24')} <span className="text-xs text-muted-foreground">{o.timezone_label}</span></span>
            ) : o.open_time ? (
              <span>
                {o.open_time}–{o.close_time} <span className="text-xs text-muted-foreground">{o.timezone_label}</span>
              </span>
            ) : (
              <span className="text-muted-foreground">{t('outlets.schedule.off')}</span>
            )}
            {o.is_open_now && <Badge tone="good" size="xs">{t('outlets.hours.open')}</Badge>}
          </span>
        ),
      },
      {
        accessorKey: 'active',
        header: t('outlets.columns.status'),
        cell: ({ row: { original: o } }) => <Badge tone={o.active ? 'good' : 'warn'}>{o.active ? t('status.record.active') : t('status.record.inactive')}</Badge>,
      },
      actionsColumn<Outlet>({
        header: t('common.actions'),
        cell: (o) => (
          <RowActions
            view={{ label: t('common.viewName', { name: o.name }), link: linkAction('/outlets/$id', { id: String(o.id) }) }}
            extra={onToggle ? [{ label: t(`toggle.${o.active ? 'off' : 'on'}Name`, { name: o.name }), icon: o.active ? <PowerOff className="size-4" aria-hidden /> : <Power className="size-4" aria-hidden />, disabled: busy, onClick: () => onToggle(o) }] : []}
            edit={{ label: t('common.editName', { name: o.name }), link: linkAction('/outlets/$id/edit', { id: String(o.id) }) }}
            remove={onDelete && { label: t('common.deleteName', { name: o.name }), disabled: busy, onClick: () => onDelete(o) }}
          />
        ),
      }),
    ],
    [t, onDelete, onToggle, busy],
  );
}
