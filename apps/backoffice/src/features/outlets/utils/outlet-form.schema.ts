import { z } from 'zod';
import { DELIVERY_TYPES, type DeliveryType, OUTLET_CATEGORIES, OUTLET_TIMEZONES, type Outlet, type OutletCategory, type OutletTimezone } from '@/core/api';
import { orderedWeek, week } from './hours';
import type { OutletDraft } from '@/services/hooks/apis';

type T = (key: string) => string;

/** A wall-clock time as the time pickers give it: HH:MM, 24 hours. */
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

/** One address: no spaces, one "@", a dot in the domain (the server and the database check the same). */
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
export const MAX_EMAIL_LENGTH = 254;

/** A contact number: digits, spaces, + - ( ), 6 to 20 characters. */
const PHONE = /^[0-9+()\-\s]{6,20}$/;

/** The most pictures an outlet can have. */
export const MAX_OUTLET_IMAGES = 8;

/** What the outlet form asks for. `images` are the banner pictures, the first one being the primary banner. */
export const outletSchema = (t: T) =>
  z.object({
    name: z.string().trim().min(1, t('outlets.nameRequired')),
    // Required: digits, spaces and + - ( ), 6 to 20 characters (the server checks the same).
    phone: z.string().trim().min(1, t('outlets.form.phoneRequired')).regex(PHONE, t('outlets.form.phoneInvalid')),
    // Required; the server lower-cases it. It must look like one address.
    email: z
      .string()
      .trim()
      .min(1, t('outlets.form.emailRequired'))
      .max(MAX_EMAIL_LENGTH, t('outlets.form.emailTooLong'))
      .regex(EMAIL, t('outlets.form.emailInvalid')),
    address: z.string(),
    latitude: z.number({ error: t('outlets.coordinateInvalid') }).min(-90, t('outlets.latitudeRange')).max(90, t('outlets.latitudeRange')),
    longitude: z.number({ error: t('outlets.coordinateInvalid') }).min(-180, t('outlets.longitudeRange')).max(180, t('outlets.longitudeRange')),
    images: z.array(z.url(t('outlets.imageInvalid'))).max(MAX_OUTLET_IMAGES, t('outlets.form.imagesMax')),
    category: z.custom<OutletCategory>((v) => OUTLET_CATEGORIES.includes(v as OutletCategory), t('outlets.form.categoryRequired')),
    delivery_types: z.array(z.custom<DeliveryType>((v) => DELIVERY_TYPES.includes(v as DeliveryType))).min(1, t('outlets.form.deliveryRequired')),
    timezone: z.custom<OutletTimezone>((v) => OUTLET_TIMEZONES.some((z) => z.value === v)),
    // Seven days, Monday first. A day that is open needs both times, and they cannot be the same.
    hours: z
      .array(z.object({ weekday: z.number(), closed: z.boolean(), open_24h: z.boolean(), open_time: z.string(), close_time: z.string() }))
      .length(7)
      .superRefine((days, ctx) => {
        days.forEach((d, i) => {
          if (d.closed || d.open_24h) return;
          for (const key of ['open_time', 'close_time'] as const) {
            if (!TIME.test(d[key])) ctx.addIssue({ code: 'custom', path: [i, key], message: t('outlets.form.timeInvalid') });
          }
          if (TIME.test(d.open_time) && TIME.test(d.close_time) && d.open_time === d.close_time) ctx.addIssue({ code: 'custom', path: [i, 'close_time'], message: t('outlets.form.timesEqual') });
        });
      }),
    active: z.boolean(),
  });
export type OutletValues = z.infer<ReturnType<typeof outletSchema>>;

export const blankOutlet = (): OutletValues => ({ name: '', phone: '', email: '', address: '', latitude: 0, longitude: 0, images: [], category: 'all', delivery_types: ['pickup', 'delivery'], timezone: 'Asia/Jakarta', hours: week(), active: true });

export const outletValues = (o: Outlet): OutletValues => ({
  name: o.name,
  phone: o.phone,
  email: o.email,
  address: o.address,
  latitude: o.latitude,
  longitude: o.longitude,
  images: o.images,
  category: o.category,
  delivery_types: o.delivery_types,
  timezone: o.timezone,
  hours: orderedWeek(o.hours),
  active: o.active,
});

/** The body the server takes: the pictures in the order of the list, the first being the main photo, and the week with no times on a closed day and the fixed 00:00 on a 24-hour one. */
export const outletBody = (v: OutletValues, outlet?: Outlet): OutletDraft => ({
  id: outlet?.id,
  ...v,
  hours: v.hours.map((d) => (d.closed ? { ...d, open_24h: false, open_time: '', close_time: '' } : d.open_24h ? { ...d, closed: false, open_time: '00:00', close_time: '00:00' } : { ...d, open_24h: false })),
});

/**
 * An address a picture can be shown from: https ones, and (for the local dev media store) http ones on this machine: the same
 * rule the server applies when it saves an outlet's photos.
 */
export const isShownImage = (url: string) => {
  if (url.startsWith('https://')) return true;
  try {
    const u = new URL(url);
    return u.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(u.hostname);
  } catch {
    return false;
  }
};
