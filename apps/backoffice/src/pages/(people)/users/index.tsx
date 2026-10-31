import { Link } from '@tanstack/react-router';
import { UserRound } from 'lucide-react';
import { buttonVariants, EmptyState, ErrorText, Page, ServerTable } from '@wuzz/web-ui';
import { StatusSelect } from '@/features/accounts';
import { useUsersPage } from '@/features/users';
import { ActivityButton } from '@/features/activity';
import { AccountsLegend } from '@/features/accounts/components/accounts-legend';

/** The customers: who signed up in the app, with their points and streaks; a customer can be blocked from signing in. */
export function UsersPage() {
  const c = useUsersPage();
  const { t, table, users } = c;
  return (
    <Page title={t('users.title')} subtitle={t('users.subtitle')} actions={<ActivityButton entityType="user" />}>
      <ErrorText error={c.error} />
      <ServerTable
        state={table}
        data={users.rows}
        total={users.total}
        ready={users.ready}
        columns={c.columns}
        rowId={(u) => u.id}
        labels={c.labels}
        filters={<StatusSelect label={t('filter.status')} value={c.status} onChange={(v) => table.setFilter('status', v)} />}
        legend={<AccountsLegend />}
        emptyState={
          <EmptyState icon={UserRound} title={t('users.emptyTitle')} description={t('users.emptyDescription')}>
            <button type="button" className={buttonVariants()} onClick={c.refresh}>{t('users.refresh')}</button>
            <Link to="/orders" className={buttonVariants()}>{t('users.seeOrders')}</Link>
          </EmptyState>
        }
      />
    </Page>
  );
}
