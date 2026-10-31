import { BadgeLegend } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import { useTaxRates } from '@/services/hooks/apis';

/** The key to the badges of the services table: on sale or not, and the tax a service carries. */
export function ServicesLegend() {
  const { t } = useTranslation();
  const ppn = useTaxRates().data?.find((r) => r.type === 'ppn');
  return (
    <BadgeLegend
      items={[
        { tone: 'good', label: t('status.record.active'), description: t('legend.services.active') },
        { tone: 'warn', label: t('status.record.inactive'), description: t('legend.services.inactive') },
        ...(ppn ? [{ tone: 'info' as const, label: t('services.form.taxPpn', { percent: ppn.rate_bps / 100 }), description: t('legend.services.ppn') }] : []),
      ]}
    />
  );
}
