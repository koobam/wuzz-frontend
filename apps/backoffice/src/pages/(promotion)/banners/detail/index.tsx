import { Link } from '@tanstack/react-router';
import { Power, PowerOff } from 'lucide-react';
import { Button, buttonVariants, ErrorText, Page } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import { ActivityButton } from '@/features/activity';
import { BannerDetail } from '@/features/banners/components/banner-detail';
import { useBannerDetailPage } from '@/features/banners/hooks/use-banner-detail-page';
import { PageNav } from '@/features/shell';

/** One banner in full, read-only; the Edit button opens the form. */
export function BannerDetailPage() {
  const { t } = useTranslation();
  const c = useBannerDetailPage();

  return (
    <Page
      title={c.banner?.title ?? t('banners.detail.title')}
      subtitle={t('banners.detail.subtitle')}
      nav={<PageNav back={{ to: '/banners' }} backLabel={t('banners.title')} trail={[{ label: t('banners.title'), to: '/banners' }]} current={c.banner?.title ?? t('banners.detail.title')} />}
      actions={
        c.banner && (
          <div className="flex flex-wrap items-center gap-2">
            <ActivityButton entityType="banner" entityId={c.banner.id} />
            <Button className="inline-flex items-center gap-2" disabled={c.busy} onClick={() => void c.onToggle()}>
              {c.banner.status === 'active' ? <PowerOff className="size-4" aria-hidden /> : <Power className="size-4" aria-hidden />}
              {t(`toggle.${c.banner.status === 'active' ? 'off' : 'on'}`)}
            </Button>
            <Button className="text-destructive hover:bg-destructive/10" disabled={c.busy} onClick={() => void c.onDelete()}>{t('common.delete')}</Button>
            <Link to="/banners/$id/edit" params={{ id: String(c.banner.id) }} className={buttonVariants({ variant: 'primary' })}>{t('common.edit')}</Link>
          </div>
        )
      }
    >
      <ErrorText error={c.error} />
      {c.loading && <p className="text-sm text-muted-foreground">{t('banners.detail.loading')}</p>}
      {c.isMissing && <p className="rounded-3xl border border-border bg-card p-5 text-sm text-muted-foreground">{t('banners.detail.notFound')}</p>}
      {c.banner && <BannerDetail banner={c.banner} targetName={c.targetName} />}
    </Page>
  );
}
