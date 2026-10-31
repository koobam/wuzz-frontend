import { useMemo } from 'react';
import type { ActivityEntity } from '@/core/api';
import { ApiError } from '@/core/http';
import { useTranslation } from '@/core/utils/i18n';
import { useTableLabels } from '@/services/hooks/use-table-labels';
import { useActivity } from '@/services/hooks/apis';
import { useServerTable } from '@wuzz/web-ui';
import { activityFiltersSchema } from '../utils/activity-filters.schema';
import { ENTITY_ACTIONS } from '../utils/activity';

const PAGE_SIZE = 10;

/**
 * The controller of the activity modal: the search and filters (zod + react-hook-form, via `useServerTable`), the page,
 * and the log of one kind of thing (and of one record, with `entityId`). It is mounted only while the modal is open, so
 * nothing is asked of the server while it is closed.
 */
export function useActivityModal({ entityType, entityId }: { entityType: ActivityEntity; entityId?: string }) {
  const { t } = useTranslation();
  const table = useServerTable({ pageSize: PAGE_SIZE, defaultSort: { id: 'created_at', desc: true }, schema: activityFiltersSchema });
  const { outcome, action } = table.filters;

  const log = useActivity(
    {
      ...table.params,
      entity_type: entityType,
      entity_id: entityId,
      outcome: outcome || undefined,
      action: (action || undefined) as never,
    },
    { enabled: true },
  );
  const labels = useTableLabels({ search: 'activity.search', showing: 'activity.showing' });

  const actionOptions = useMemo(
    () => [{ value: '', label: t('activity.allActions') }, ...ENTITY_ACTIONS[entityType].map((a) => ({ value: a, label: t(`activity.actions.${a}`) }))],
    [entityType, t],
  );
  const outcomeOptions = useMemo(
    () => [
      { value: '', label: t('activity.allOutcomes') },
      { value: 'ok', label: t('activity.outcome.ok') },
      { value: 'failed', label: t('activity.outcome.failed') },
    ],
    [t],
  );

  return {
    t,
    table,
    labels,
    outcome,
    action,
    actionOptions,
    outcomeOptions,
    entries: log.data?.items ?? [],
    total: log.data?.total ?? 0,
    loading: log.isLoading,
    ready: !!log.data,
    // Only administrators may read the log; the server says so with 403.
    forbidden: log.error instanceof ApiError && log.error.status === 403,
    error: log.error instanceof ApiError && log.error.status === 403 ? null : log.error,
  };
}
