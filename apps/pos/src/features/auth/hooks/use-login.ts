import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { loginSchema, type LoginValues } from '../utils/login.schema';
import { useTranslation } from '@/core/utils/i18n';
import { useSendCode, useVerifyCode } from '@/services/hooks/use-session';

/**
 * Everything the sign-in page does: the form (typed by the schema above), which step it is on, and the calls to the
 * server. After the code is accepted it goes where the person was headed, or home.
 */
export function useLogin(redirectTo?: string) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const sendCode = useSendCode();
  const verify = useVerifyCode();
  const [sent, setSent] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema(t, sent ? 'code' : 'phone')),
    defaultValues: { phone: '', code: '' },
  });

  const submit = form.handleSubmit(({ phone, code }) => {
    if (!sent) return sendCode.mutate(phone, { onSuccess: () => setSent(true) });
    verify.mutate({ phone, code }, { onSuccess: () => navigate({ to: redirectTo ?? '/' }) });
  });

  /** Back to the phone step, to type another number. */
  const changeNumber = () => {
    form.resetField('code');
    setSent(false);
  };

  return {
    form,
    sent,
    submit,
    changeNumber,
    pending: sendCode.isPending || verify.isPending,
    verifying: verify.isPending,
    error: (verify.error ?? sendCode.error) as Error | null,
  };
}
