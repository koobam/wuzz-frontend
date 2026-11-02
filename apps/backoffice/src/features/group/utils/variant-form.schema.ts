import { z } from 'zod';
import type { VariantGroup } from '@/core/api';

type T = (key: string) => string;

/** What the variant form asks for: a name, notes, and the options of which a customer picks exactly one. */
export const variantSchema = (t: T) =>
  z.object({
    name: z.string().trim().min(1, t('groups.nameRequired')).max(80),
    internal_notes: z.string(),
    options: z
      .array(
        z.object({
          // The option's id on the server; named apart from react-hook-form's own `id` of a list row.
          optionId: z.number().optional(),
          name: z.string().trim().min(1, t('groups.optionNameRequired')).max(80),
          price_delta: z.number({ error: t('groups.numberInvalid') }).min(0, t('groups.numberInvalid')),
          is_default: z.boolean(),
          active: z.boolean(),
        }),
      )
      .min(1)
      .max(30),
  });
export type VariantValues = z.infer<ReturnType<typeof variantSchema>>;
export type VariantOptionValues = VariantValues['options'][number];

export const blankVariantOption = (is_default = false): VariantOptionValues => ({ name: '', price_delta: 0, is_default, active: true });
export const blankVariant = (): VariantValues => ({ name: '', internal_notes: '', options: [blankVariantOption(true)] });

export const variantValues = (g: VariantGroup): VariantValues => ({
  name: g.name,
  internal_notes: g.internal_notes,
  options: g.options.map((o) => ({ optionId: o.id, name: o.name, price_delta: o.price_delta, is_default: o.is_default, active: o.active })),
});

/** The body the server takes: the options carry their own ids again. */
export const variantBody = (v: VariantValues) => ({
  name: v.name,
  internal_notes: v.internal_notes,
  options: v.options.map(({ optionId, ...o }) => ({ id: optionId, ...o })),
});
