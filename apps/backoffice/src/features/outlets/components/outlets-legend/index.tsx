import { BadgeLegend } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';

/** The key to the badges of the outlets table. */
export function OutletsLegend() {
  const { t } = useTranslation();
  return (
    <BadgeLegend
      items={[
        { tone: 'good', label: t('status.record.active'), description: t('legend.outlets.active') },
        { tone: 'warn', label: t('status.record.inactive'), description: t('legend.outlets.inactive') },
        { tone: 'good', label: t('outlets.hours.open'), description: t('legend.outlets.open') },
      ]}
    />
  );
}
