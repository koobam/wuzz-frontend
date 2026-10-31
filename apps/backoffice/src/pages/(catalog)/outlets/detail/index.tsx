import { Link } from '@tanstack/react-router';
import { Button, buttonVariants, ErrorText } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import { PageNav } from '@/features/shell';
import { OutletBanner } from '@/features/outlets/components/outlet-map';
import { OutletDetail } from '@/features/outlets/components/outlet-detail';
import { OutletsHeader } from '@/features/outlets/components/outlets-header';
import { useOutletDetailPage } from '@/features/outlets/hooks/use-outlet-detail-page';
import { ActivityButton } from '@/features/activity';

/** One outlet in full, read-only; the Edit button opens the form. Its title block is drawn over the bottom of the map. */
export function OutletDetailPage() {
  const { t } = useTranslation();
  const c = useOutletDetailPage();
  const name = c.outlet?.name ?? t('outlets.detail.detailTitle');

  return (
    <OutletBanner
      markers={c.markers}
      selectedId={c.outlet?.id}
      header={
        <OutletsHeader
          nav={<PageNav inline back={{ to: '/outlets' }} backLabel={t('outlets.title')} trail={[{ label: t('outlets.title'), to: '/outlets' }]} current={name} />}
          title={name}
          description={t('outlets.detail.subtitle')}
          actions={
            c.outlet && (
              <>
                <ActivityButton entityType="outlet" entityId={c.outlet.id} />
                <Button variant="outline" className="text-destructive hover:bg-destructive/10" disabled={c.deleting} onClick={() => void c.onDelete()}>{t('common.delete')}</Button>
                <Link to="/outlets/$id/edit" params={{ id: String(c.outlet.id) }} className={buttonVariants({ variant: 'primary' })}>{t('common.edit')}</Link>
              </>
            )
          }
        />
      }
    >
      <ErrorText error={c.error && !c.isMissing ? c.error : null} />
      {c.loading && <p className="text-sm text-muted-foreground">{t('outlets.detail.loading')}</p>}
      {c.isMissing && <p className="rounded-3xl border border-border bg-card p-5 text-sm text-muted-foreground">{t('outlets.detail.notFound')}</p>}
      {c.outlet && <OutletDetail outlet={c.outlet} people={c.people} />}
    </OutletBanner>
  );
}
