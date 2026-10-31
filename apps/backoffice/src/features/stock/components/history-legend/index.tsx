import { BadgeLegend } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import { kindTone, STOCK_KIND_ORDER } from '../../utils/kind';

/** The key to the movement-kind badges of the stock history table. */
export function HistoryLegend() {
  const { t } = useTranslation();
  return <BadgeLegend items={STOCK_KIND_ORDER.map((k) => ({ tone: kindTone(k), label: t(`history.kind.${k}`), description: t(`legend.history.${k}`) }))} />;
}
