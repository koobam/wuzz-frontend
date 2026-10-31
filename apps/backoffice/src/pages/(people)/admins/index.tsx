import { Page } from '@wuzz/web-ui';
import { AccountsList } from '@/features/accounts';
import { useTranslation } from '@/core/utils/i18n';
import { ActivityButton } from '@/features/activity';

export function AdminsPage() {
  const { t } = useTranslation();
  return (
    <Page title={t('accounts.admins.title')} subtitle={t('accounts.admins.subtitle')} actions={<ActivityButton entityType="user" />}>
      <AccountsList kind="admins" />
    </Page>
  );
}
