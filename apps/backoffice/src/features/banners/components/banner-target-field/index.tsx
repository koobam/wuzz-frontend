import { Target } from 'lucide-react';
import { Badge, Field, Select, TextField } from '@wuzz/web-ui';
import { type BannerTargetType, type Outlet, type Service } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { previewDeeplink } from '../../utils/banner-display';

/**
 * The target's own control, by kind: nothing for "no target", a service or outlet picker, one of the app's screens, or a web
 * address; beside it, the link the customer app will open (read-only, copyable), worked out as the server will.
 */
export function BannerTargetField({
  type,
  value,
  onChange,
  services,
  outlets,
  screens,
  error,
  loading,
}: {
  type: BannerTargetType;
  value: string;
  onChange: (value: string) => void;
  services: Service[];
  outlets: Outlet[];
  screens: string[];
  error?: string;
  loading: boolean;
}) {
  const { t } = useTranslation();
  if (type === 'none') {
    return (
      <p className="flex items-center gap-2 rounded-xl border border-dashed border-input px-4 py-3 text-sm text-muted-foreground">
        <Target className="size-4 shrink-0" aria-hidden /> {t('banners.form.targetNoneNote')}
      </p>
    );
  }
  const deeplink = previewDeeplink(type, value);
  const label = t(`banners.form.targetLabel.${type}`);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {type === 'external' ? (
        <TextField label={label} hint={t('banners.form.externalHint')} placeholder={t('banners.form.externalPlaceholder')} type="url" inputMode="url" maxLength={500} error={error} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <Field label={label} error={error} hint={loading ? t('banners.form.loadingChoices') : undefined}>
          {(id) =>
            type === 'screen' ? (
              <Select
                inputId={id}
                ariaLabel={label}
                className="w-full"
                searchable
                placeholder={t('banners.form.pick.screen')}
                value={value || null}
                onChange={onChange}
                options={screens.map((s) => ({ value: s, label: t(`banners.screens.${s}`, { defaultValue: s }) }))}
              />
            ) : (
              <Select
                inputId={id}
                ariaLabel={label}
                className="w-full"
                searchable
                placeholder={t(`banners.form.pick.${type}`)}
                value={value ? Number(value) : null}
                onChange={(v) => onChange(String(v))}
                options={type === 'service' ? services.map((s) => ({ value: s.id, label: s.name })) : outlets.map((o) => ({ value: o.id, label: o.name }))}
              />
            )
          }
        </Field>
      )}
      <Field label={t('banners.form.deeplink')} hint={t('banners.form.deeplinkHint')}>
        {() =>
          deeplink ? (
            <span className="flex min-h-[2.75rem] items-center rounded-xl border border-dashed border-input px-4 py-2">
              <Badge copy={deeplink} tone="muted" size="sm">{deeplink}</Badge>
            </span>
          ) : (
            <p className="flex min-h-[2.75rem] items-center rounded-xl border border-dashed border-input px-4 py-2 text-sm text-muted-foreground">{t('banners.form.deeplinkEmpty')}</p>
          )
        }
      </Field>
    </div>
  );
}
