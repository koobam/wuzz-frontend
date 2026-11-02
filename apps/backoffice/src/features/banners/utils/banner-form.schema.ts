import { z } from 'zod';
import { BANNER_TARGETS, type Banner, type BannerBody, type BannerStatus, type BannerTargetType } from '@/core/api';

type T = (key: string, options?: Record<string, unknown>) => string;

/** The size of the picture the customer app draws (width : height). */
export const BANNER_RATIO = { width: 16, height: 9 };
export const MAX_TITLE = 120;
export const MAX_NOTES = 500;

const pad = (n: number) => String(n).padStart(2, '0');

/** An instant as a form holds it: "YYYY-MM-DDTHH:mm" in the browser's zone ("" for none). */
export function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** The form's local moment back to an instant the server takes (RFC 3339), or null for none. */
export function fromLocalInput(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

const isHttps = (v: string) => {
  try {
    const u = new URL(v);
    return u.protocol === 'https:' && u.hostname.includes('.');
  } catch {
    return false;
  }
};

/** What the banner form asks for. */
export const bannerSchema = (t: T) =>
  z
    .object({
      title: z.string().trim().min(1, t('banners.form.titleRequired')).max(MAX_TITLE, t('banners.form.titleTooLong', { max: MAX_TITLE })),
      internal_notes: z.string().trim().max(MAX_NOTES, t('banners.form.notesTooLong', { max: MAX_NOTES })),
      image_url: z.string(),
      target_type: z.custom<BannerTargetType>((v) => BANNER_TARGETS.includes(v as BannerTargetType)),
      target_value: z.string().trim(),
      status: z.custom<BannerStatus>((v) => v === 'active' || v === 'inactive'),
      starts_at: z.string(),
      ends_at: z.string(),
      scope: z.enum(['all', 'some']),
      outlet_ids: z.array(z.number()),
    })
    .superRefine((b, ctx) => {
      const at = (path: string, message: string) => ctx.addIssue({ code: 'custom', path: [path], message });
      if (b.status === 'active' && !b.image_url) at('image_url', t('banners.form.imageNeededToActivate'));
      if (b.target_type === 'service' || b.target_type === 'outlet') {
        if (!/^[1-9]\d*$/.test(b.target_value)) at('target_value', t(`banners.form.pick.${b.target_type}`));
      }
      if (b.target_type === 'screen' && !b.target_value) at('target_value', t('banners.form.pick.screen'));
      if (b.target_type === 'external' && !isHttps(b.target_value)) at('target_value', t('banners.form.externalInvalid'));
      if (b.starts_at && b.ends_at && new Date(b.ends_at).getTime() <= new Date(b.starts_at).getTime()) at('ends_at', t('banners.form.endBeforeStart'));
      if (b.scope === 'some' && b.outlet_ids.length === 0) at('outlet_ids', t('banners.form.outletsRequired'));
    });
export type BannerValues = z.infer<ReturnType<typeof bannerSchema>>;

export const blankBanner = (): BannerValues => ({
  title: '',
  internal_notes: '',
  image_url: '',
  target_type: 'none',
  target_value: '',
  status: 'inactive',
  starts_at: '',
  ends_at: '',
  scope: 'all',
  outlet_ids: [],
});

export const bannerValues = (b: Banner): BannerValues => ({
  title: b.title,
  internal_notes: b.internal_notes,
  image_url: b.image_url,
  target_type: b.target_type,
  target_value: b.target_value,
  status: b.status,
  starts_at: toLocalInput(b.starts_at),
  ends_at: toLocalInput(b.ends_at),
  scope: b.outlet_ids.length > 0 ? 'some' : 'all',
  outlet_ids: b.outlet_ids,
});

/** What the form sends: a leftover target is dropped with "no target", the outlets with "every outlet", and the moments go as instants. */
export const bannerBody = (v: BannerValues): BannerBody => ({
  title: v.title.trim(),
  internal_notes: v.internal_notes.trim(),
  image_url: v.image_url,
  target_type: v.target_type,
  target_value: v.target_type === 'none' ? '' : v.target_value.trim(),
  status: v.status,
  starts_at: fromLocalInput(v.starts_at),
  ends_at: fromLocalInput(v.ends_at),
  outlet_ids: v.scope === 'all' ? [] : v.outlet_ids,
});

/** A banner turned on or off, sent back as it is. */
export const bannerBodyOf = (b: Banner, status: BannerStatus): BannerBody => ({ ...bannerBody({ ...bannerValues(b), status }) });
