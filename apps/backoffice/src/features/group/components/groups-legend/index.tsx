import { BadgeLegend } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';

/** The key to the rule badges of the variant groups table (always pick exactly one) and of the modifier groups table. */
export function GroupsLegend({ kind }: { kind: 'variants' | 'modifiers' }) {
  const { t } = useTranslation();
  return (
    <BadgeLegend
      items={
        kind === 'variants'
          ? [{ tone: 'warn', label: t('groups.modifiers.ruleExact', { n: 1 }), description: t('legend.variants.rule') }]
          : [
              { tone: 'warn', label: t('groups.modifiers.ruleMin', { min: 1 }), description: t('legend.modifiers.required') },
              { tone: 'muted', label: t('groups.modifiers.ruleOptional'), description: t('legend.modifiers.optional') },
            ]
      }
    />
  );
}
