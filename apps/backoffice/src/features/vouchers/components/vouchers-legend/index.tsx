import { BadgeLegend } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';

/** The key to the badges of the vouchers table: published or not, and why a voucher can or cannot be used. */
export function VouchersLegend() {
  const { t } = useTranslation();
  return (
    <BadgeLegend
      items={[
        { tone: 'good', label: t('status.record.active'), description: t('legend.vouchers.active') },
        { tone: 'warn', label: t('status.record.inactive'), description: t('legend.vouchers.inactive') },
        { tone: 'good', label: t('vouchers.live.live'), description: t('legend.vouchers.live') },
        { tone: 'info', label: t('vouchers.live.scheduled'), description: t('legend.vouchers.scheduled') },
        { tone: 'muted', label: t('vouchers.live.ended'), description: t('legend.vouchers.ended') },
        { tone: 'warn', label: t('vouchers.live.off'), description: t('legend.vouchers.off') },
        { tone: 'info', label: t('vouchers.type.code'), description: t('legend.vouchers.code') },
        { tone: 'muted', label: t('vouchers.type.public'), description: t('legend.vouchers.public') },
      ]}
    />
  );
}
