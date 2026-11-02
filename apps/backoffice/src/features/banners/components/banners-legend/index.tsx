import { BadgeLegend } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';

/** The key to the badges of the banners table: published or not, and why a banner does or does not show on a phone. */
export function BannersLegend() {
  const { t } = useTranslation();
  return (
    <BadgeLegend
      items={[
        { tone: 'good', label: t('status.record.active'), description: t('legend.banners.active') },
        { tone: 'warn', label: t('status.record.inactive'), description: t('legend.banners.inactive') },
        { tone: 'good', label: t('banners.live.live'), description: t('legend.banners.live') },
        { tone: 'info', label: t('banners.live.scheduled'), description: t('legend.banners.scheduled') },
        { tone: 'muted', label: t('banners.live.ended'), description: t('legend.banners.ended') },
        { tone: 'warn', label: t('banners.live.off'), description: t('legend.banners.off') },
      ]}
    />
  );
}
