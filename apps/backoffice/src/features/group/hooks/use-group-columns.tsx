import type { ColumnDef } from '@tanstack/react-table';
import { Link } from '@tanstack/react-router';
import { type ReactNode, useMemo } from 'react';
import { actionsColumn, RowActions } from '@wuzz/web-ui';
import type { GroupUse } from '@/core/api';
import { linkAction } from '@/core/utils/link-action';
import { useTranslation } from '@/core/utils/i18n';
import { useDateFormat } from '@/services/hooks/use-date-format';

type Group = { id: number; name: string; internal_notes: string; options: unknown[]; services: GroupUse[]; created_at: string; updated_at: string };

/**
 * The columns both group lists share (id, name, notes, rule, options, dates, actions). A kind of group says how its rule
 * and its options are drawn.
 */
export function useGroupColumns<G extends Group>({
  kind,
  rule,
  options,
  busy,
  onDelete,
}: {
  /** Which list this is: the name links to the group's page. */
  kind: 'variants' | 'modifiers';
  rule: (g: G) => ReactNode;
  options: (g: G) => ReactNode;
  busy: boolean;
  onDelete: (g: G) => void;
}) {
  const { t } = useTranslation();
  const date = useDateFormat();
  return useMemo<ColumnDef<G>[]>(
    () => [
      { accessorKey: 'id', header: t('groups.columns.id'), cell: ({ row }) => <span className="text-muted-foreground">{row.original.id}</span> },
      {
        accessorKey: 'name',
        header: t('groups.columns.name'),
        meta: { className: 'max-w-xs' },
        cell: ({ row: { original: g } }) => (
          <>
            {kind === 'variants' ? (
              <Link to="/variants/$id" params={{ id: String(g.id) }} className="font-medium hover:underline">{g.name}</Link>
            ) : (
              <Link to="/modifiers/$id" params={{ id: String(g.id) }} className="font-medium hover:underline">{g.name}</Link>
            )}
            <div className="text-xs text-muted-foreground">
              {[t('groups.optionCount', { count: g.options.length }), g.services.length ? t('groups.usedIn', { count: g.services.length }) : ''].filter(Boolean).join(' · ')}
            </div>
          </>
        ),
      },
      { id: 'notes', enableSorting: false, header: t('groups.columns.notes'), meta: { className: 'max-w-xs text-xs text-muted-foreground' }, cell: ({ row }) => row.original.internal_notes || t('groups.none') },
      { id: 'rule', enableSorting: false, header: t('groups.columns.rule'), meta: { className: 'whitespace-nowrap' }, cell: ({ row }) => rule(row.original) },
      {
        id: 'options',
        enableSorting: false,
        header: t('groups.columns.options'),
        cell: ({ row }) => <div className="flex max-w-md flex-wrap gap-1.5">{options(row.original)}</div>,
      },
      { accessorKey: 'created_at', header: t('groups.columns.created'), meta: { className: 'whitespace-nowrap text-xs' }, cell: ({ row }) => date(row.original.created_at) },
      { accessorKey: 'updated_at', header: t('groups.columns.updated'), meta: { className: 'whitespace-nowrap text-xs' }, cell: ({ row }) => date(row.original.updated_at) },
      actionsColumn<G>({
        header: t('common.actions'),
        cell: (g) => (
          <RowActions
            view={{ label: t('common.viewName', { name: g.name }), link: linkAction(`/${kind}/$id`, { id: String(g.id) }) }}
            edit={{ label: t('common.editName', { name: g.name }), link: linkAction(`/${kind}/$id/edit`, { id: String(g.id) }) }}
            remove={{ label: t('common.deleteName', { name: g.name }), disabled: busy, onClick: () => onDelete(g) }}
          />
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, date, busy],
  );
}
