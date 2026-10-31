import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import type { GroupUse } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { useDateFormat } from '@/services/hooks/use-date-format';

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-3 last:border-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-medium">{children}</dd>
    </div>
  );
}

/**
 * A variant or modifier group, read-only: its note and rule, its options (as pills, drawn by the kind of group), the
 * services that use it (each a link) and when it was made and last changed.
 */
export function GroupDetail({
  group,
  rule,
  options,
}: {
  group: { id: number; internal_notes: string; services: GroupUse[]; created_at: string; updated_at: string };
  rule: ReactNode;
  options: ReactNode;
}) {
  const { t } = useTranslation();
  const date = useDateFormat();
  return (
    <div className="grid items-start gap-5 lg:grid-cols-[22rem_1fr]">
      <dl className="rounded-3xl border border-border bg-card px-5 py-2">
        <Row label={t('groups.columns.id')}>{group.id}</Row>
        <Row label={t('groups.columns.notes')}>{group.internal_notes || t('groups.none')}</Row>
        <Row label={t('groups.columns.rule')}>{rule}</Row>
        <Row label={t('groups.detail.createdAt')}>{date(group.created_at)}</Row>
        <Row label={t('groups.detail.updatedAt')}>{date(group.updated_at)}</Row>
      </dl>
      <section className="space-y-5 rounded-3xl border border-border bg-card p-5">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">{t('groups.options')}</h3>
          <div className="flex flex-wrap gap-1.5">{options}</div>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">{t('groups.detail.usedBy')}</h3>
          {group.services.length === 0 ? (
            <p className="text-xs text-muted-foreground">{t('groups.unused')}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {group.services.map((s) => (
                <Link key={s.id} to="/services/$id" params={{ id: String(s.id) }} className="inline-flex items-center rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs whitespace-nowrap hover:bg-accent">
                  {s.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
