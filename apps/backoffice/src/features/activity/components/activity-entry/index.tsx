import { Avatar, Badge } from '@wuzz/web-ui';
import type { ActivityEntry } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { useDateFormat } from '@/services/hooks/use-date-format';
import { actorRole, detailRows, relativeTime } from '../../utils/activity';

/** One line of the log: who, what they did (as a sentence), when, whether it worked, and the fields they sent. */
export function ActivityEntryRow({ entry, sentence }: { entry: ActivityEntry; sentence: string }) {
  const { t, i18n } = useTranslation();
  const date = useDateFormat();
  const role = actorRole(entry.actor.roles);
  const rows = detailRows(entry.changes);
  const failed = entry.outcome === 'failed';

  return (
    <li className="flex gap-3 border-b border-border py-3 last:border-b-0">
      <Avatar id={entry.actor.id || String(entry.id)} name={entry.actor.name || '?'} size={32} />
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sm">
          <span className="font-medium">{entry.actor.name || t('activity.unknownActor')}</span>
          {role && <span className="text-muted-foreground"> · {role}</span>}
        </p>
        <p className="text-sm">{sentence}</p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <time dateTime={entry.created_at} title={date(entry.created_at)}>{relativeTime(entry.created_at, i18n.language)}</time>
          <Badge tone={failed ? 'bad' : 'good'} size="xs">{failed ? t('activity.failedWith', { status: entry.status }) : t('activity.outcome.ok')}</Badge>
          <span>{t(`activity.audience.${entry.audience}`, { defaultValue: entry.audience })}</span>
        </div>
        {rows.length > 0 && (
          <details className="group text-xs">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">{t('activity.details')}</summary>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-xl border border-border bg-background p-3">
              {rows.map((r) => (
                <div key={r.key} className="contents">
                  <dt className="font-mono text-muted-foreground">{r.key}</dt>
                  <dd className="min-w-0 break-words">{r.value}</dd>
                </div>
              ))}
            </dl>
          </details>
        )}
      </div>
    </li>
  );
}
