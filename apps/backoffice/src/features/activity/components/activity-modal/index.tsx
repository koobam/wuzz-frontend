import { BadgeLegend, Input, Modal, Pagination, ResetFilters, Select } from '@wuzz/web-ui';
import type { ActivityEntity } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { useActivityModal } from '../../hooks/use-activity-modal';
import { useActivitySentence } from '../../hooks/use-activity-sentence';
import { ActivityEntryRow } from '../activity-entry';

/** The list inside the modal. It is mounted only while the modal is open, so nothing is fetched before. */
function ActivityList({ entityType, entityId }: { entityType: ActivityEntity; entityId?: string }) {
  const c = useActivityModal({ entityType, entityId });
  const sentence = useActivitySentence(entityType);
  const { t, table } = c;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input shape="pill" type="search" className="min-w-40 flex-1" value={table.search} onChange={(e) => table.setSearch(e.target.value)} placeholder={c.labels.searchPlaceholder} aria-label={c.labels.searchPlaceholder} maxLength={64} />
        <Select className="min-w-40" ariaLabel={t('activity.filterOutcome')} value={c.outcome} onChange={(v) => table.setFilter('outcome', v as '' | 'ok' | 'failed')} options={c.outcomeOptions} />
        <Select className="min-w-48" ariaLabel={t('activity.filterAction')} value={c.action} onChange={(v) => table.setFilter('action', v)} options={c.actionOptions} />
      </div>
      {table.active && <ResetFilters block label={c.labels.reset} onClick={table.reset} />}

      {c.forbidden && <p className="rounded-2xl border border-border bg-background p-4 text-sm text-muted-foreground">{t('activity.forbidden')}</p>}
      {c.error != null && <p className="text-sm text-destructive">{(c.error as Error).message}</p>}
      {c.loading && <p className="text-sm text-muted-foreground">{t('activity.loading')}</p>}
      {c.ready && c.entries.length === 0 && (
        <p className="rounded-2xl border border-border bg-background p-4 text-sm text-muted-foreground">
          {table.active ? c.labels.noResultsTitle : t('activity.empty')}
        </p>
      )}
      {c.entries.length > 0 && (
        <ul>
          {c.entries.map((e) => (
            <ActivityEntryRow key={e.id} entry={e} sentence={sentence(e)} />
          ))}
        </ul>
      )}
      {c.ready && c.total > 0 && (
        <Pagination offset={table.offset} pageSize={table.pageSize} total={c.total} showing={c.labels.showing} previous={c.labels.previous} next={c.labels.next} onChange={table.setOffset} />
      )}
      <BadgeLegend
        items={[
          { tone: 'good', label: t('activity.outcome.ok'), description: t('legend.activity.ok') },
          { tone: 'bad', label: t('activity.outcome.failed'), description: t('legend.activity.failed') },
        ]}
      />
    </div>
  );
}

/** The activity of one kind of thing (or one record) in a modal: who did what and when, filterable and paged. */
export function ActivityModal({ open, onClose, title, entityType, entityId }: { open: boolean; onClose: () => void; title: string; entityType: ActivityEntity; entityId?: string }) {
  const { t } = useTranslation();
  return (
    <Modal open={open} onClose={onClose} title={title} description={t('activity.subtitle')} closeLabel={t('activity.close')}>
      {open && <ActivityList key={`${entityType}:${entityId ?? ''}`} entityType={entityType} entityId={entityId} />}
    </Modal>
  );
}
