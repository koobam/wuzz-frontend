import { Link } from '@tanstack/react-router';
import { buttonVariants, EmptyState, ErrorText, FilterField, Select, ServerTable } from '@wuzz/web-ui';
import { ShieldCheck, UserCog } from 'lucide-react';
import { useAccountsPage } from '../../hooks/use-accounts-page';
import { StatusSelect } from '../status-select';
import { AccountsLegend } from '../accounts-legend';

/** The table behind both the Admins and the Staff pages: the same columns and filters over a different endpoint. */
export function AccountsList({ kind }: { kind: 'admins' | 'staff' }) {
  const { t, table, accounts, outlets, status, outlet, ...c } = useAccountsPage(kind);

  return (
    <>
      <ErrorText error={c.error} />
      <ServerTable
        state={table}
        data={accounts.rows}
        total={accounts.total}
        ready={accounts.ready}
        columns={c.columns}
        rowId={(a) => a.id}
        labels={c.labels}
        filters={
          <>
            <StatusSelect label={t('filter.status')} value={status} onChange={(v) => table.setFilter('status', v)} />
            <FilterField label={t('filter.outlet')}>
            <Select
              ariaLabel={t('filter.outlet')}
              className="w-full"
              value={outlet}
              onChange={(v) => table.setFilter('outlet', v)}
              options={[{ value: 0, label: t('accounts.allOutlets') }, ...outlets.map((o) => ({ value: o.id, label: o.name }))]}
            />
            </FilterField>
          </>
        }
        legend={<AccountsLegend />}
        emptyState={
          <EmptyState icon={kind === 'admins' ? ShieldCheck : UserCog} title={t(`accounts.${kind}.emptyTitle`)} description={t(`accounts.${kind}.emptyDescription`)}>
            <button type="button" className={buttonVariants()} onClick={c.refresh}>{t('accounts.refresh')}</button>
            <Link to={kind === 'admins' ? '/staff' : '/outlets'} className={buttonVariants()}>{t(`accounts.${kind}.seeOther`)}</Link>
          </EmptyState>
        }
      />
    </>
  );
}
