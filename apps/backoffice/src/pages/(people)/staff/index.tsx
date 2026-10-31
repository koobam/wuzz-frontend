import { Page } from '@wuzz/web-ui';
import { AccountsList } from '@/features/accounts';
import { useTranslation } from '@/core/utils/i18n';
import { ActivityButton } from '@/features/activity';

export function StaffPage() {
  const { t } = useTranslation();
  return (
    <Page title={t('accounts.staff.title')} subtitle={t('accounts.staff.subtitle')} actions={<ActivityButton entityType="user" />}>
      <AccountsList kind="staff" />
    </Page>
  );
}
