import { Link } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { Power, PowerOff } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { actionsColumn, Badge, RowActions } from '@wuzz/web-ui';
import type { Banner, Outlet, Service } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { linkAction } from '@/core/utils/link-action';
import { BannerThumb } from '../components/banner-thumb';
import { liveState, LIVE_TONE, shortMoment, zoneName } from '../utils/banner-display';

/** What a banner opens, in words: the service's or outlet's name, the screen's name, or the web address. */
export function useTargetName(services: Service[] | undefined, outlets: Outlet[] | undefined) {
  const { t } = useTranslation();
  return useCallback(
    (b: Pick<Banner, 'target_type' | 'target_value'>): string => {
      if (b.target_type === 'service') return services?.find((s) => String(s.id) === b.target_value)?.name ?? `#${b.target_value}`;
      if (b.target_type === 'outlet') return outlets?.find((o) => String(o.id) === b.target_value)?.name ?? `#${b.target_value}`;
      if (b.target_type === 'screen') return t(`banners.screens.${b.target_value}`, { defaultValue: b.target_value });
      return b.target_value;
    },
    [services, outlets, t],
  );
}

/** The columns of the banners table: id, picture and title (opens the banner), where a tap goes, the schedule, the outlets, whether it is published, whether it shows, and the row actions. */
export function useBannersColumns(targetName: (b: Pick<Banner, 'target_type' | 'target_value'>) => string, { onDelete, onToggle, busy = false }: { onDelete?: (b: Banner) => void; onToggle?: (b: Banner) => void; busy?: boolean } = {}) {
  const { t, i18n } = useTranslation();
  return useMemo<ColumnDef<Banner>[]>(
    () => [
      { accessorKey: 'id', header: t('banners.columns.id'), cell: ({ row }) => <span className="text-muted-foreground">{row.original.id}</span> },
      {
        accessorKey: 'title',
        header: t('banners.columns.banner'),
        cell: ({ row: { original: b } }) => (
          <span className="flex min-w-0 items-center gap-3">
            <BannerThumb banner={b} className="w-24" />
            <Link to="/banners/$id" params={{ id: String(b.id) }} className="line-clamp-2 max-w-40 min-w-0 font-medium hover:underline">{b.title}</Link>
          </span>
        ),
      },
      {
        id: 'target',
        enableSorting: false,
        header: t('banners.columns.target'),
        cell: ({ row: { original: b } }) =>
          b.target_type === 'none' ? (
            <span className="text-muted-foreground">{t('banners.target.none')}</span>
          ) : (
            <span className="flex flex-col items-start gap-1">
              <span className="flex items-center gap-1.5">
                <Badge tone="info" size="xs">{t(`banners.target.${b.target_type}`)}</Badge>
                <span className="max-w-40 truncate text-sm" title={targetName(b)}>{targetName(b)}</span>
              </span>
              {b.deeplink && b.target_type !== 'external' && <Badge copy={b.deeplink} tone="muted" size="2xs">{b.deeplink}</Badge>}
            </span>
          ),
      },
      {
        accessorKey: 'starts_at',
        header: t('banners.columns.schedule', { zone: zoneName() }),
        meta: { className: 'text-sm' },
        cell: ({ row: { original: b } }) =>
          !b.starts_at && !b.ends_at ? (
            <span className="text-muted-foreground">{t('banners.schedule.always')}</span>
          ) : (
            <span className="block space-y-0.5 text-xs whitespace-nowrap">
              <span className="block">{b.starts_at ? shortMoment(b.starts_at, i18n.language) : t('banners.schedule.now')}</span>
              <span className="block text-muted-foreground">→ {b.ends_at ? shortMoment(b.ends_at, i18n.language) : t('banners.schedule.noEnd')}</span>
            </span>
          ),
      },
      {
        id: 'outlets',
        enableSorting: false,
        header: t('banners.columns.outlets'),
        cell: ({ row: { original: b } }) =>
          b.outlets.length === 0 ? (
            <span className="text-muted-foreground">{t('banners.outlets.all')}</span>
          ) : (
            <span className="block max-w-36 text-sm" title={b.outlets.map((o) => o.name).join(', ')}>
              {b.outlets.slice(0, 2).map((o) => o.name).join(', ')}
              {b.outlets.length > 2 && <span className="text-muted-foreground"> {t('banners.outlets.more', { count: b.outlets.length - 2 })}</span>}
            </span>
          ),
      },
      {
        accessorKey: 'status',
        header: t('banners.columns.status'),
        cell: ({ row: { original: b } }) => {
          const state = liveState(b);
          return (
            <span className="flex flex-col items-start gap-1">
              <Badge tone={b.status === 'active' ? 'good' : 'warn'}>{b.status === 'active' ? t('status.record.active') : t('status.record.inactive')}</Badge>
              <Badge tone={LIVE_TONE[state]}>{t(`banners.live.${state}`)}</Badge>
            </span>
          );
        },
      },
      actionsColumn<Banner>({
        header: t('common.actions'),
        cell: (b) => (
          <RowActions
            view={{ label: t('common.viewName', { name: b.title }), link: linkAction('/banners/$id', { id: String(b.id) }) }}
            extra={onToggle ? [{ label: t(`toggle.${b.status === 'active' ? 'off' : 'on'}Name`, { name: b.title }), icon: b.status === 'active' ? <PowerOff className="size-4" aria-hidden /> : <Power className="size-4" aria-hidden />, disabled: busy, onClick: () => onToggle(b) }] : []}
            edit={{ label: t('common.editName', { name: b.title }), link: linkAction('/banners/$id/edit', { id: String(b.id) }) }}
            remove={onDelete && { label: t('common.deleteName', { name: b.title }), disabled: busy, onClick: () => onDelete(b) }}
          />
        ),
      }),
    ],
    [t, i18n.language, targetName, onDelete, onToggle, busy],
  );
}
