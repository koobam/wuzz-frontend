import { Link } from '@tanstack/react-router';
import { Megaphone } from 'lucide-react';
import { Button, buttonVariants, EmptyState, ErrorText, Page } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import { ActivityButton } from '@/features/activity';
import { BannerOrder } from '@/features/banners/components/banner-order';
import { useBannerOrder } from '@/features/banners/hooks/use-banner-order';
import { PageNav } from '@/features/shell';

/** The page that arranges the banners into the order the customer app's carousel shows them in. */
export function BannerOrderPage() {
  const { t } = useTranslation();
  const c = useBannerOrder();

  return (
    <Page
      title={t('banners.order.title')}
      subtitle={t('banners.order.subtitle')}
      nav={<PageNav back={{ to: '/banners' }} backLabel={t('banners.title')} trail={[{ label: t('banners.title'), to: '/banners' }]} current={t('banners.order.title')} />}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <ActivityButton entityType="banner" />
          <Button disabled={!c.dirty || c.saving} onClick={c.reset}>{t('banners.order.reset')}</Button>
          <Button variant="primary" disabled={!c.dirty || c.saving} onClick={() => void c.save()}>{t('banners.order.save')}</Button>
        </div>
      }
    >
      <ErrorText error={c.error} />
      {!c.ready && !c.error && <p className="text-sm text-muted-foreground">{t('banners.detail.loading')}</p>}
      {c.ready && c.banners.length === 0 && (
        <EmptyState icon={Megaphone} title={t('banners.emptyTitle')} description={t('banners.emptyDescription')}>
          <Link to="/banners/new" className={buttonVariants({ variant: 'primary' })}>{t('banners.add')}</Link>
        </EmptyState>
      )}
      {c.banners.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground">{c.dirty ? t('banners.order.unsaved') : t('banners.order.hint')}</p>
          <BannerOrder banners={c.banners} onMove={c.move} />
        </>
      )}
    </Page>
  );
}
