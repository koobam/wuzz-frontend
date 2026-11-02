import { Link } from '@tanstack/react-router';
import { ArrowDownUp, Megaphone } from 'lucide-react';
import { buttonVariants, EmptyState, ErrorText, Page, ServerTable } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import { ActivityButton } from '@/features/activity';
import { BannersFilters } from '@/features/banners/components/banners-filters';
import { BannersLegend } from '@/features/banners/components/banners-legend';
import { useBannersPage } from '@/features/banners/hooks/use-banners-page';

export function BannersPage() {
  const { t } = useTranslation();
  const c = useBannersPage();

  return (
    <Page
      title={t('banners.title')}
      subtitle={t('banners.subtitle')}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <ActivityButton entityType="banner" />
          <Link to="/banners/order" className={`${buttonVariants({ variant: 'outline' })} inline-flex items-center gap-2`}>
            <ArrowDownUp className="size-4" aria-hidden /> {t('banners.arrange')}
          </Link>
          <Link to="/banners/new" className={buttonVariants({ variant: 'primary' })}>{t('banners.add')}</Link>
        </div>
      }
    >
      <ErrorText error={c.error} />
      <ServerTable
        state={c.table}
        data={c.rows}
        total={c.total}
        ready={c.ready}
        columns={c.columns}
        rowId={(b) => String(b.id)}
        labels={c.labels}
        filters={<BannersFilters {...c.filters} />}
        legend={<BannersLegend />}
        emptyState={
          <EmptyState icon={Megaphone} title={t('banners.emptyTitle')} description={t('banners.emptyDescription')}>
            <Link to="/banners/new" className={buttonVariants({ variant: 'primary' })}>{t('banners.add')}</Link>
          </EmptyState>
        }
      />
    </Page>
  );
}
