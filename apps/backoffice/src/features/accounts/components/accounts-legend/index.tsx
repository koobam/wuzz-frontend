import { BadgeLegend } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import { ACCOUNT_STATUSES, accountTone } from '../../utils/status';

/** The key to the status badges of the customers, admins and staff tables. */
export function AccountsLegend() {
  const { t } = useTranslation();
  return <BadgeLegend items={ACCOUNT_STATUSES.map((s) => ({ tone: accountTone(s), label: t(`status.user.${s}`), description: t(`legend.accounts.${s}`) }))} />;
}
