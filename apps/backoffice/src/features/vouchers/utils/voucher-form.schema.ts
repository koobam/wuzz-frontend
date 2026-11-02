import { z } from 'zod';
import { VOUCHER_COLORS, type Voucher, type VoucherBody, type VoucherDiscountType, type VoucherStatus, type VoucherType } from '@/core/api';
import { fromLocalInput, toLocalInput } from '@/features/banners/utils/banner-form.schema';

type T = (key: string, options?: Record<string, unknown>) => string;

export { fromLocalInput, toLocalInput };

export const MAX_TITLE = 120;
export const MAX_DESCRIPTION = 500;
export const MAX_NOTES = 500;
/** The proportions of the optional picture. */
export const VOUCHER_RATIO = { width: 16, height: 9 };
export const MAX_CODE = 20;
export const MIN_CODE = 4;

const whole = (v: string) => /^\d+$/.test(v.trim());
const num = (v: string) => (whole(v) ? Number(v.trim()) : 0);

/** What the voucher form asks for. The amounts are typed as text and checked here, so an empty or half-typed field is a message, not NaN. */
export const voucherSchema = (t: T) =>
  z
    .object({
      title: z.string().trim().min(1, t('vouchers.form.titleRequired')).max(MAX_TITLE, t('vouchers.form.titleTooLong', { max: MAX_TITLE })),
      description: z.string().trim().max(MAX_DESCRIPTION, t('vouchers.form.descriptionTooLong', { max: MAX_DESCRIPTION })),
      internal_notes: z.string().trim().max(MAX_NOTES, t('vouchers.form.notesTooLong', { max: MAX_NOTES })),
      color: z.string(),
      image_url: z.string(),
      type: z.custom<VoucherType>((v) => v === 'public' || v === 'code'),
      code: z.string().trim(),
      discount_type: z.custom<VoucherDiscountType>((v) => v === 'percentage' || v === 'amount'),
      value: z.string().trim(),
      max_discount: z.string().trim(),
      min_spend: z.string().trim(),
      usage_limit: z.string().trim(),
      max_claims: z.string().trim(),
      status: z.custom<VoucherStatus>((v) => v === 'active' || v === 'inactive'),
      starts_at: z.string(),
      ends_at: z.string(),
      outlet_scope: z.enum(['all', 'some']),
      outlet_ids: z.array(z.number()),
      service_scope: z.enum(['all', 'some']),
      service_ids: z.array(z.number()),
    })
    .superRefine((v, ctx) => {
      const at = (path: string, message: string) => ctx.addIssue({ code: 'custom', path: [path], message });
      if (!(VOUCHER_COLORS as readonly string[]).includes(v.color)) at('color', t('vouchers.form.colorRequired'));
      if (!whole(v.value) || num(v.value) < 1) at('value', t('vouchers.form.valueRequired'));
      else if (v.discount_type === 'percentage' && num(v.value) > 100) at('value', t('vouchers.form.percentMax'));
      if (v.discount_type === 'percentage' && v.max_discount && !whole(v.max_discount)) at('max_discount', t('vouchers.form.wholeNumber'));
      if (v.min_spend && !whole(v.min_spend)) at('min_spend', t('vouchers.form.wholeNumber'));
      if (!whole(v.usage_limit) || num(v.usage_limit) < 1) at('usage_limit', t('vouchers.form.usageRequired'));
      if (v.type === 'code') {
        if (v.code.length < MIN_CODE || v.code.length > MAX_CODE || !/^[A-Z0-9]+$/.test(v.code)) at('code', t('vouchers.form.codeInvalid', { min: MIN_CODE, max: MAX_CODE }));
        if (v.max_claims && !whole(v.max_claims)) at('max_claims', t('vouchers.form.wholeNumber'));
      }
      if (v.starts_at && v.ends_at && new Date(v.ends_at).getTime() <= new Date(v.starts_at).getTime()) at('ends_at', t('vouchers.form.endBeforeStart'));
      if (v.outlet_scope === 'some' && v.outlet_ids.length === 0) at('outlet_ids', t('vouchers.form.outletsRequired'));
      if (v.service_scope === 'some' && v.service_ids.length === 0) at('service_ids', t('vouchers.form.servicesRequired'));
    });
export type VoucherValues = z.infer<ReturnType<typeof voucherSchema>>;

export const blankVoucher = (): VoucherValues => ({
  title: '',
  description: '',
  internal_notes: '',
  color: VOUCHER_COLORS[0],
  image_url: '',
  type: 'public',
  code: '',
  discount_type: 'percentage',
  value: '',
  max_discount: '',
  min_spend: '',
  usage_limit: '1',
  max_claims: '',
  status: 'inactive',
  starts_at: '',
  ends_at: '',
  outlet_scope: 'all',
  outlet_ids: [],
  service_scope: 'all',
  service_ids: [],
});

const text = (n: number) => (n > 0 ? String(n) : '');

export const voucherValues = (v: Voucher): VoucherValues => ({
  title: v.title,
  description: v.description,
  internal_notes: v.internal_notes,
  color: v.color,
  image_url: v.image_url,
  type: v.type,
  code: v.code,
  discount_type: v.discount_type,
  value: String(v.value),
  max_discount: text(v.max_discount),
  min_spend: text(v.min_spend),
  usage_limit: String(v.usage_limit),
  max_claims: text(v.max_claims),
  status: v.status,
  starts_at: toLocalInput(v.starts_at),
  ends_at: toLocalInput(v.ends_at),
  outlet_scope: v.outlet_ids.length > 0 ? 'some' : 'all',
  outlet_ids: v.outlet_ids,
  service_scope: v.service_ids.length > 0 ? 'some' : 'all',
  service_ids: v.service_ids,
});

/** What the form sends: what does not apply to the chosen kind is dropped (no code and claim limit on a public voucher, no cap on an amount), and the moments go as instants. */
export const voucherBody = (v: VoucherValues): VoucherBody => ({
  title: v.title.trim(),
  description: v.description.trim(),
  internal_notes: v.internal_notes.trim(),
  color: v.color,
  image_url: v.image_url,
  type: v.type,
  code: v.type === 'code' ? v.code.trim() : '',
  discount_type: v.discount_type,
  value: num(v.value),
  max_discount: v.discount_type === 'percentage' ? num(v.max_discount) : 0,
  min_spend: num(v.min_spend),
  max_claims: v.type === 'code' ? num(v.max_claims) : 0,
  usage_limit: num(v.usage_limit),
  status: v.status,
  starts_at: fromLocalInput(v.starts_at),
  ends_at: fromLocalInput(v.ends_at),
  outlet_ids: v.outlet_scope === 'all' ? [] : v.outlet_ids,
  service_ids: v.service_scope === 'all' ? [] : v.service_ids,
});

/** A voucher turned on or off, sent back as it is. */
export const voucherBodyOf = (v: Voucher, status: VoucherStatus): VoucherBody => voucherBody({ ...voucherValues(v), status });
