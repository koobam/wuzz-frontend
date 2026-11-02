import { Badge, LanguageSwitch } from '@wuzz/web-ui';
import { envBadge } from '@/core/utils/app-env';
import { useTranslation } from '@/core/utils/i18n';
import { navigation } from '@/config/navigation';
import { SlidingNav } from '../sliding-nav';
import { UserMenu } from '../user-menu';

/** Three pills: who this is, where to go, and the account. */
export function TopBar() {
  const { t } = useTranslation();
  const env = envBadge();

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex flex-wrap items-center gap-3 p-3 sm:p-5 [&>*]:pointer-events-auto">
      <div className="flex items-center gap-3 rounded-full border border-border bg-card py-2 pr-6 pl-4">
        <img src="/logo.svg" alt="" className="h-8 w-auto dark:rounded-lg dark:bg-white dark:p-1" />
        <span className="flex flex-col items-start gap-1.5">
          <span className="text-base leading-none font-bold tracking-tight">{t('nav.brand')}</span>
          {env && <Badge tone={env.tone} size="2xs">{t(env.label)}</Badge>}
        </span>
      </div>

      <SlidingNav items={navigation} className="order-last w-full lg:order-none lg:mx-auto lg:w-auto" />

      <div className="ml-auto flex items-center gap-3 lg:ml-0">
        <LanguageSwitch />
        <UserMenu />
      </div>
    </header>
  );
}
