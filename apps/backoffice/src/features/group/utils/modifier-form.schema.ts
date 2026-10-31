import { z } from 'zod';
import type { ModifierGroup } from '@/core/api';

type T = (key: string) => string;

/**
 * What the modifier form asks for: a name, notes, how many options may be picked (`min`, and `max` where an empty box
 * means no limit, which is why it is text here) and the options, each with the price it adds.
 */
export const modifierSchema = (t: T) =>
  z.object({
    name: z.string().trim().min(1, t('groups.nameRequired')).max(80),
    internal_notes: z.string(),
    min: z.number({ error: t('groups.numberInvalid') }).int(t('groups.numberInvalid')).min(0, t('groups.numberInvalid')),
    max: z.string().trim().refine((v) => v === '' || (Number.isInteger(Number(v)) && Number(v) >= 1), t('groups.maxInvalid')),
    options: z
      .array(
        z.object({
          // The option's id on the server; named apart from react-hook-form's own `id` of a list row.
          optionId: z.number().optional(),
          name: z.string().trim().min(1, t('groups.optionNameRequired')).max(80),
          price: z.number({ error: t('groups.numberInvalid') }).min(0, t('groups.numberInvalid')),
          active: z.boolean(),
        }),
      )
      .min(1)
      .max(30),
  });
export type ModifierValues = z.infer<ReturnType<typeof modifierSchema>>;
export type ModifierOptionValues = ModifierValues['options'][number];

export const blankModifierOption = (): ModifierOptionValues => ({ name: '', price: 0, active: true });
export const blankModifier = (): ModifierValues => ({ name: '', internal_notes: '', min: 0, max: '', options: [blankModifierOption()] });

export const modifierValues = (g: ModifierGroup): ModifierValues => ({
  name: g.name,
  internal_notes: g.internal_notes,
  min: g.min,
  max: g.max === null ? '' : String(g.max),
  options: g.options.map((o) => ({ optionId: o.id, name: o.name, price: o.price, active: o.active })),
});

/** The body the server takes: an empty `max` is no limit, and the options carry their own ids again. */
export const modifierBody = (v: ModifierValues) => ({
  name: v.name,
  internal_notes: v.internal_notes,
  min: v.min,
  max: v.max === '' ? null : Number(v.max),
  options: v.options.map(({ optionId, ...o }) => ({ id: optionId, ...o })),
});
