import { z } from 'zod';
import { summarizePhones } from './phones';

type T = (key: string, options?: Record<string, unknown>) => string;

/** A customer picked from the list. */
export type Recipient = { id: string; name: string; phone: string };

export const MAX_RECIPIENTS = 500;

/** What the send form asks for: a voucher, and at least one recipient (pasted numbers, picked customers, or both), none of the pasted lines wrong. */
export const voucherSendSchema = (t: T) =>
  z
    .object({
      voucher_id: z.number().int().min(1, t('vouchers.send.voucherRequired')),
      phones_text: z.string(),
      customers: z.array(z.object({ id: z.string(), name: z.string(), phone: z.string() })),
    })
    .superRefine((v, ctx) => {
      const { phones, invalid } = summarizePhones(v.phones_text);
      const total = recipientCount(phones, v.customers);
      if (invalid.length > 0) ctx.addIssue({ code: 'custom', path: ['phones_text'], message: t('vouchers.send.invalidLines', { count: invalid.length }) });
      else if (total === 0) ctx.addIssue({ code: 'custom', path: ['phones_text'], message: t('vouchers.send.recipientsRequired') });
      else if (total > MAX_RECIPIENTS) ctx.addIssue({ code: 'custom', path: ['phones_text'], message: t('vouchers.send.tooMany', { max: MAX_RECIPIENTS }) });
    });
export type VoucherSendValues = z.infer<ReturnType<typeof voucherSendSchema>>;

export const blankSend = (voucherId = 0): VoucherSendValues => ({ voucher_id: voucherId, phones_text: '', customers: [] });

/** The numbers pasted that a picked customer does not already stand for (a customer with the same phone is sent once, by id). */
export function extraPhones(phones: string[], customers: Recipient[]): string[] {
  const picked = new Set(customers.map((c) => c.phone));
  return phones.filter((p) => !picked.has(p));
}

/** How many distinct customers the send is aimed at. */
export function recipientCount(phones: string[], customers: Recipient[]): number {
  return customers.length + extraPhones(phones, customers).length;
}
