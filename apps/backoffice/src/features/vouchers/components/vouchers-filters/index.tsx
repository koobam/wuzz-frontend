import { FilterField, Select } from '@wuzz/web-ui';
import type { Outlet } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';

type Status = '' | 'active' | 'inactive';
type Period = '' | 'running' | 'upcoming' | 'ended' | 'unlimited';
type Discount = '' | 'percentage' | 'amount';

/** The voucher list's filters: whether it is published, where its window stands, the kind of discount and the outlet it can be used at. */
export function VouchersFilters({
  outlets,
  status,
  period,
  discount,
  outlet,
  onStatus,
  onPeriod,
  onDiscount,
  onOutlet,
}: {
  outlets: Outlet[];
  status: Status;
  period: Period;
  discount: Discount;
  outlet: number;
  onStatus: (v: Status) => void;
  onPeriod: (v: Period) => void;
  onDiscount: (v: Discount) => void;
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
      <FilterField label={t('vouchers.filter.period')}>
        <Select
          ariaLabel={t('vouchers.filter.period')}
          className="w-full"
          value={period}
          onChange={onPeriod}
          options={[
            { value: '' as const, label: t('status.allShort') },
            { value: 'running' as const, label: t('vouchers.filter.running') },
            { value: 'upcoming' as const, label: t('vouchers.filter.upcoming') },
            { value: 'ended' as const, label: t('vouchers.filter.ended') },
            { value: 'unlimited' as const, label: t('vouchers.filter.unlimited') },
          ]}
        />
      </FilterField>
      <FilterField label={t('vouchers.filter.discount')}>
        <Select
          ariaLabel={t('vouchers.filter.discount')}
          className="w-full"
          value={discount}
          onChange={onDiscount}
          options={[
            { value: '' as const, label: t('status.allShort') },
            { value: 'percentage' as const, label: t('vouchers.discount.percentage') },
            { value: 'amount' as const, label: t('vouchers.discount.amount') },
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
          options={[{ value: 0, label: t('vouchers.filter.anyOutlet') }, ...outlets.map((o) => ({ value: o.id, label: o.name }))]}
        />
      </FilterField>
    </>
  );
}
