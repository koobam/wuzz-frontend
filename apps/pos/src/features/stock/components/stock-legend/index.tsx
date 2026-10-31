import { BadgeLegend } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';

/** The key to the badges of the stock table. */
export function StockLegend() {
  const { t } = useTranslation();
  return (
    <BadgeLegend
      items={[
        { tone: 'warn', label: t('stock.low'), description: t('legend.stock.low') },
        { tone: 'bad', label: t('stock.negative'), description: t('legend.stock.negative') },
      ]}
    />
  );
}
