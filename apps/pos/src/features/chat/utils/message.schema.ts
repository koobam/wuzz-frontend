import { z } from 'zod';

/** A message to send: its text, which cannot be empty. */
export const messageSchema = z.object({
  body: z.string().trim().min(1),
});
export type MessageValues = z.infer<typeof messageSchema>;
