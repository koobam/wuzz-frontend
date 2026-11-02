import { FilterField, Select } from '@wuzz/web-ui';
import type { Outlet } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';

type Status = '' | 'active' | 'inactive';
type Live = '' | 'true' | 'false';

/** The banner list's filters: whether it is published, whether it is on a phone right now, and the outlet it shows at. */
export function BannersFilters({
  outlets,
  status,
  live,
  outlet,
  onStatus,
  onLive,
  onOutlet,
}: {
  outlets: Outlet[];
  status: Status;
  live: Live;
  outlet: number;
  onStatus: (v: Status) => void;
  onLive: (v: Live) => void;
  onOutlet: (v: number) => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      <FilterField label={t('filter.status')}>
        <Select
          ariaLabel={t('filter.status')}
          className="w-full"
          value={status}
          onChange={onStatus}
          options={[
            { value: '' as const, label: t('status.allShort') },
            { value: 'active' as const, label: t('status.record.active') },
            { value: 'inactive' as const, label: t('status.record.inactive') },
          ]}
        />
      </FilterField>
      <FilterField label={t('filter.live')}>
        <Select
          ariaLabel={t('filter.live')}
          className="w-full"
          value={live}
          onChange={onLive}
          options={[
            { value: '' as const, label: t('status.allShort') },
            { value: 'true' as const, label: t('banners.filter.liveYes') },
            { value: 'false' as const, label: t('banners.filter.liveNo') },
          ]}
        />
      </FilterField>
      <FilterField label={t('filter.outlet')}>
        <Select
          ariaLabel={t('filter.outlet')}
          className="w-full"
          searchable
          value={outlet}
          onChange={onOutlet}
          options={[{ value: 0, label: t('banners.filter.anyOutlet') }, ...outlets.map((o) => ({ value: o.id, label: o.name }))]}
        />
      </FilterField>
    </>
  );
}
