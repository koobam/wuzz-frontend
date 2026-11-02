import { z } from 'zod';
import { DISCOUNT_TYPES, SERVICE_UNITS, TAX_TYPES, type DiscountType, type Service, type ServiceBody, type ServiceUnit, type TaxType } from '@/core/api';

type T = (key: string) => string;

/** What the service form asks for: its name, unit, category, price before tax, tax type and notes, and the variant and modifier groups it carries. */
export const serviceSchema = (t: T) =>
  z.object({
    name: z.string().trim().min(1, t('services.nameRequired')),
    unit: z.custom<ServiceUnit>((v) => SERVICE_UNITS.includes(v as ServiceUnit)),
    category_id: z.number(),
    price_before_tax: z.number({ error: t('services.priceInvalid') }).int(t('services.priceInvalid')).min(0, t('services.priceInvalid')),
    discount_type: z.custom<DiscountType>((v) => DISCOUNT_TYPES.includes(v as DiscountType)),
    /** What staff type: rupiah for a fixed discount, a percentage (up to 2 decimals) for a percent one. */
    discount_input: z.number({ error: t('services.form.discountInvalid') }).min(0, t('services.form.discountInvalid')),
    tax_type: z.custom<TaxType>((v) => TAX_TYPES.includes(v as TaxType)),
    internal_notes: z.string().trim().max(500, t('services.notesTooLong')),
    active: z.boolean(),
    variant_group_ids: z.array(z.number()),
    modifier_group_ids: z.array(z.number()),
    /** The icon picture: its media id is what is saved, its address is only for the preview. */
    icon_media_id: z.string(),
    icon_url: z.string(),
  })
    .refine((v) => v.discount_type !== 'percent' || v.discount_input <= 100, { path: ['discount_input'], message: t('services.form.discountPercentMax') })
    .refine((v) => v.discount_type !== 'value' || v.discount_input <= v.price_before_tax, { path: ['discount_input'], message: t('services.form.discountTooBig') })
    .refine((v) => v.discount_type !== 'value' || Number.isInteger(v.discount_input), { path: ['discount_input'], message: t('services.form.discountInvalid') });
export type ServiceValues = z.infer<ReturnType<typeof serviceSchema>>;

export const blankService = (): ServiceValues => ({
  name: '',
  unit: 'kg',
  category_id: 0,
  price_before_tax: 0,
  discount_type: 'none',
  discount_input: 0,
  tax_type: 'none',
  internal_notes: '',
  active: true,
  variant_group_ids: [],
  modifier_group_ids: [],
  icon_media_id: '',
  icon_url: '',
});

export const serviceValues = (s: Service): ServiceValues => ({
  name: s.name,
  unit: s.unit,
  category_id: s.category_id,
  price_before_tax: s.price_before_tax,
  discount_type: s.discount_type,
  discount_input: s.discount_type === 'percent' ? s.discount_value / 100 : s.discount_value,
  tax_type: s.tax_type,
  internal_notes: s.internal_notes,
  active: s.active,
  variant_group_ids: s.variant_groups.map((g) => g.id),
  modifier_group_ids: s.modifier_groups.map((g) => g.id),
  icon_media_id: s.icon_media_id ?? '',
  icon_url: s.icon_url ?? '',
});

/** The discount as the server stores it: whole rupiah, or basis points (12.5% -> 1250); nothing for `none`. */
export const discountValueOf = (v: Pick<ServiceValues, 'discount_type' | 'discount_input'>) =>
  v.discount_type === 'percent' ? Math.round(v.discount_input * 100) : v.discount_type === 'value' ? v.discount_input : 0;

/** What the form sends: the values less the typed discount (with the server's `discount_value`) and less the icon's preview address. */
export const serviceBody = ({ discount_input: _typed, icon_url: _preview, ...values }: ServiceValues): ServiceBody & { active: boolean } => ({ ...values, discount_value: discountValueOf({ discount_type: values.discount_type, discount_input: _typed }) });
