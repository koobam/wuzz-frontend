/** A modifier group's rule in words: "Optional", "Pick exactly 2", "Required, 1–2". */
export const modifierRule = (t: (key: string, options?: Record<string, unknown>) => string, g: { min: number; max: number | null }) => {
  if (g.max !== null && g.min === g.max) return t('groups.modifiers.ruleExact', { n: g.min });
  if (g.min === 0) return g.max === null ? t('groups.modifiers.ruleOptional') : t('groups.modifiers.ruleOptionalMax', { max: g.max });
  return g.max === null ? t('groups.modifiers.ruleMin', { min: g.min }) : t('groups.modifiers.ruleRange', { min: g.min, max: g.max });
};
