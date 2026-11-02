import { FilterField, Select } from '@wuzz/web-ui';
import { STOCK_KINDS, type Outlet, type StockKind } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';

/** The filters over the stock ledger: the outlet and the kind of movement. */
export function HistoryFilters({ outlet, kind, outlets, onOutlet, onKind }: { outlet: number; kind: StockKind | ''; outlets: Outlet[]; onOutlet: (id: number) => void; onKind: (kind: StockKind | '') => void }) {
  const { t } = useTranslation();
  return (
    <>
      <FilterField label={t('filter.outlet')}><Select ariaLabel={t('filter.outlet')} className="w-full" value={outlet} onChange={onOutlet} options={[{ value: 0, label: t('stock.allOutlets') }, ...outlets.map((o) => ({ value: o.id, label: o.name }))]} /></FilterField>
      <FilterField label={t('filter.kind')}><Select ariaLabel={t('filter.kind')} className="w-full" value={kind} onChange={onKind} options={[{ value: '' as StockKind | '', label: t('history.allKinds') }, ...STOCK_KINDS.map((k) => ({ value: k as StockKind | '', label: t(`history.kind.${k}`) }))]} /></FilterField>
    </>
  );
}
