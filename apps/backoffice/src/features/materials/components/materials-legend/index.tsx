import { BadgeLegend } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';

/** The key to the badges of the materials table. */
export function MaterialsLegend() {
  const { t } = useTranslation();
  return (
    <BadgeLegend
      items={[
        { tone: 'good', label: t('materials.active'), description: t('legend.materials.active') },
        { tone: 'muted', label: t('materials.inactive'), description: t('legend.materials.inactive') },
      ]}
    />
  );
}
