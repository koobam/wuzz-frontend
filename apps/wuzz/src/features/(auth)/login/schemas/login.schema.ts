import { z } from 'zod';

/** Spaces and dashes people type between the digits; the server reads the number the same either way. */
export const normalizePhoneInput = (value: string) => value.replace(/[\s-]/g, '');

/**
 * What was typed in the phone field as one number the server reads whole: `+<country code><number>`.
 * A number typed with its own plus is already complete and is kept as it is. Otherwise the trunk zero is dropped
 * (0812… is 812… in Indonesia, as in most countries), and so is a country code the person typed again after choosing it.
 */
export const toInternationalPhone = (dial: string, input: string) => {
  const typed = normalizePhoneInput(input);
  if (typed.startsWith('+')) return typed;
  let digits = typed.replace(/^0+/, '');
  if (digits.startsWith(dial) && digits.length > dial.length + 7) digits = digits.slice(dial.length);
  return `+${dial}${digits}`;
};

export const loginSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(1, 'errors.phoneRequired')
    .refine(value => /^\+?\d{6,15}$/.test(normalizePhoneInput(value)), 'errors.phoneInvalid'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
