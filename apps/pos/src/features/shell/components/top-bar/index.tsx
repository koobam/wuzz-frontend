import { Badge, LanguageSwitch } from '@wuzz/web-ui';
import { envBadge } from '@/core/utils/app-env';
import { useTranslation } from '@/core/utils/i18n';
import { useOnline } from '@/core/pos/hooks';
import { navigation } from '@/config/navigation';
import { SlidingNav } from '../sliding-nav';
import { UserMenu } from '../user-menu';

/** Three pills: where this is, where to go, and the account; plus whether the till is online. */
export function TopBar() {
  const { t } = useTranslation();
  const env = envBadge();
  const online = useOnline();

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex flex-wrap items-center gap-3 p-3 sm:p-5 [&>*]:pointer-events-auto">
      <div className="flex items-center gap-3 rounded-full border border-border bg-card py-2 pr-6 pl-4">
        <img src="/logo.svg" alt="" className="h-8 w-auto dark:rounded-lg dark:bg-white dark:p-1" />
        <span className="flex flex-col items-start gap-1.5">
          <span className="text-base leading-none font-bold tracking-tight">{t('app.name')}</span>
          {env && <Badge tone={env.tone} size="2xs">{t(env.label)}</Badge>}
        </span>
      </div>

      <SlidingNav items={navigation} className="order-last w-full md:order-none md:mx-auto md:w-auto" />

      <div className="ml-auto flex items-center gap-3 md:ml-0">
        <span
          className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs lg:flex"
          title={online ? t('status.online') : t('status.offline')}
        >
          <span className={`size-2 rounded-full ${online ? 'bg-green-500' : 'bg-destructive'}`} aria-hidden />
          {online ? t('status.online') : t('status.offline')}
        </span>
        <LanguageSwitch />
        <UserMenu />
      </div>
    </header>
  );
}
