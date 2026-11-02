import { useSearch } from '@tanstack/react-router';
import { LoginShell } from '@/features/auth/components/login-shell';
import { Badge, Button, LanguageSwitch, TextField } from '@wuzz/web-ui';
import { envBadge } from '@/core/utils/app-env';
import { useTranslation } from '@/core/utils/i18n';
import { useLogin } from '@/features/auth';


export function LoginPage() {
  const { t } = useTranslation();
  const env = envBadge();
  const { redirect: redirectTo } = useSearch({ from: '/login' });
  const { form, sent, submit, changeNumber, pending, verifying, error } = useLogin(redirectTo);
  const { register, watch, formState } = form;

  return (
    <LoginShell
      slides={[
        { image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=1600&q=80&fit=crop', text: t('login.slides.one') },
        { image: 'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=1600&q=80&fit=crop', text: t('login.slides.two') },
        { image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1600&q=80&fit=crop', text: t('login.slides.three') },
      ]}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="" className="h-8 w-auto dark:rounded-lg dark:bg-white dark:p-1" />
          <span className="font-bold tracking-tight whitespace-nowrap">{t('login.title')}</span>
        </div>
        <LanguageSwitch />
      </div>

      <form onSubmit={submit} className="my-auto space-y-4 py-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('login.welcome')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('login.subtitle')}</p>
        </div>

        <TextField
          label={t('login.phonePlaceholder')}
          required
          type="tel"
          inputMode="tel"
          placeholder="0812…"
          disabled={sent}
          autoFocus
          error={formState.errors.phone?.message}
          {...register('phone')}
        />
        {sent && (
          <TextField
            label={t('login.codePlaceholder')}
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="••••••"
            autoFocus
            error={formState.errors.code?.message}
            {...register('code')}
          >
            <Button variant="link" onClick={changeNumber}>
              {t('login.useDifferentNumber')}
            </Button>
          </TextField>
        )}
        {error && <p className="text-sm text-destructive">{error.message}</p>}
        <Button type="submit" variant="primary" size="lg" block disabled={pending || !watch('phone')}>
          {sent
            ? verifying
              ? t('login.verifying')
              : t('login.signIn')
            : pending
              ? t('login.sending')
              : t('login.sendCode')}
        </Button>
        <p className="text-center text-xs text-muted-foreground">{t('login.adminNote')}</p>
      </form>

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <span>{t('login.footer')}</span>
        {env && <Badge tone={env.tone} size="xs">{t(env.label)}</Badge>}
      </div>
    </LoginShell>
  );
}
