import { z } from 'zod';

/** The two steps of signing in: say the phone number, then type the code that was sent to it. */
export type LoginStep = 'phone' | 'code';

export const loginSchema = (t: (key: string) => string, step: LoginStep) =>
  z.object({
    phone: z.string().trim().min(1, t('login.phoneRequired')),
    code: step === 'code' ? z.string().trim().min(1, t('login.codeRequired')) : z.string(),
  });
export type LoginValues = z.infer<ReturnType<typeof loginSchema>>;
