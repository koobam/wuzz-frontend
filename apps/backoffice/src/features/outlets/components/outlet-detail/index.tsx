import { Badge } from '@wuzz/web-ui';
import type { Account, Outlet } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { isShownImage } from '../../utils/outlet-form.schema';
import { OutletContact } from '../outlet-contact';
import { OutletGallery } from '../outlet-gallery';
import { OutletHours } from '../outlet-hours';
import { OutletStaff } from '../outlet-staff';

/** An outlet, read-only: on the left who it is and how to reach it, and when it is open; on the right its banner pictures and the people who work there. */
export function OutletDetail({ outlet: o, people }: { outlet: Outlet; people: { staff: Account[]; admins: Account[]; total: number; loading: boolean; error: Error | null } }) {
  const { t } = useTranslation();
  const pictures = o.images.filter(isShownImage);
  return (
    <div className="grid items-start gap-5 lg:grid-cols-[2fr_3fr]">
      <div className="space-y-5">
        <section className="space-y-2 rounded-3xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h2 className="text-xl font-semibold tracking-tight">{o.name}</h2>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground tabular-nums" title={t('outlets.columns.id')}>#{o.id}</span>
            <Badge tone={o.active ? 'good' : 'warn'}>{o.active ? t('status.record.active') : t('status.record.inactive')}</Badge>
          </div>
          <OutletContact outlet={o} />
        </section>
        <OutletHours outlet={o} />
      </div>
      <div className="space-y-5">
        <section className="space-y-3 rounded-3xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">{t('outlets.detail.gallery', { count: pictures.length })}</h2>
          <OutletGallery pictures={pictures} outletId={o.id} name={o.name} />
        </section>
        <OutletStaff staff={people.staff} admins={people.admins} total={people.total} loading={people.loading} error={people.error} />
      </div>
    </div>
  );
}
