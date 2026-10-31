import { BadgeLegend } from '@wuzz/web-ui';
import type { StockKind } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { kindTone } from '../../utils/kind';

const KINDS: StockKind[] = ['receipt', 'consumption', 'consumption_reversal', 'waste', 'adjustment', 'transfer_in', 'transfer_out'];

/** The key to the movement-kind badges of the stock history table. */
export function HistoryLegend() {
  const { t } = useTranslation();
  return <BadgeLegend items={KINDS.map((k) => ({ tone: kindTone(k), label: t(`stock.kind.${k}`), description: t(`legend.kind.${k}`) }))} />;
}
