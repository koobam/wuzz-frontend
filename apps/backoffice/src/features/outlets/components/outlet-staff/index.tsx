import { Link } from '@tanstack/react-router';
import { Users } from 'lucide-react';
import { Avatar, Badge } from '@wuzz/web-ui';
import type { Account } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { accountTone } from '@/features/accounts/utils/status';

function Person({ account: a }: { account: Account }) {
  const { t } = useTranslation();
  return (
    <li className="flex items-center gap-3 py-3">
      <Avatar id={a.id} name={a.name} size={36} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{a.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {t(`accounts.roles.${a.role}`, { defaultValue: a.role })} · {a.phone}
        </p>
      </div>
      <Badge tone={accountTone(a.status)} size="xs">{t(`status.user.${a.status}`)}</Badge>
    </li>
  );
}

/** The people who work at an outlet: its staff, and the admins tied to it, with a link to the whole staff list. */
export function OutletStaff({ staff, admins, total, loading, error }: { staff: Account[]; admins: Account[]; total: number; loading: boolean; error: Error | null }) {
  const { t } = useTranslation();
  return (
    <section className="space-y-3 rounded-3xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Users className="size-4 text-muted-foreground" aria-hidden /> {t('outlets.detail.staffTitle')}
          {!loading && !error && <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground tabular-nums">{total}</span>}
        </h2>
        <Link to="/staff" className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline">{t('outlets.staff.viewAll')}</Link>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-destructive">{error.message}</p>
      ) : loading ? (
        <p className="text-sm text-muted-foreground">{t('outlets.detail.loading')}</p>
      ) : staff.length === 0 && admins.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">{t('outlets.staff.empty')}</p>
      ) : (
        <>
          <ul className="divide-y divide-border">
            {staff.map((a) => <Person key={a.id} account={a} />)}
          </ul>
          {admins.length > 0 && (
            <div className="space-y-1">
              <h3 className="pt-2 text-xs font-medium text-muted-foreground">{t('outlets.staff.admins')}</h3>
              <ul className="divide-y divide-border">
                {admins.map((a) => <Person key={a.id} account={a} />)}
              </ul>
            </div>
          )}
        </>
      )}
      {total > staff.length && staff.length > 0 && <p className="text-xs text-muted-foreground">{t('outlets.staff.more', { count: total - staff.length })}</p>}
    </section>
  );
}
