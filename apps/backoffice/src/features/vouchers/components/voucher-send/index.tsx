import { CheckCircle2, Plus, Send, X } from 'lucide-react';
import { Controller } from 'react-hook-form';
import { Badge, Button, ErrorText, Field, Input, Select, Textarea } from '@wuzz/web-ui';
import { skippedTotal } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import type { useVoucherSend } from '../../hooks/use-voucher-send';
import { MAX_RECIPIENTS } from '../../utils/voucher-send.schema';
import { VoucherStub } from '../voucher-stub';

const SECTION = 'space-y-4 rounded-3xl border border-border bg-card p-5';

/** The form that sends a voucher into customers' wallets: the voucher, the numbers pasted or the customers picked, and what came of the last send. */
export function VoucherSend({ send: s }: { send: ReturnType<typeof useVoucherSend> }) {
  const { t } = useTranslation();
  const { control, formState } = s.form;
  const { errors } = formState;
  const skippedReasons = s.result ? Object.entries(s.result.skipped).filter(([, n]) => n > 0) : [];

  return (
    <form noValidate onSubmit={s.submit} className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="min-w-0 space-y-5">
        <section className={SECTION}>
          <div className="space-y-0.5">
            <h2 className="text-sm font-semibold">{t('vouchers.send.sectionVoucher')}</h2>
            <p className="text-xs text-muted-foreground">{t('vouchers.send.voucherDescription')}</p>
          </div>
          <Controller
            control={control}
            name="voucher_id"
            render={({ field }) => (
              <Field label={t('vouchers.send.voucher')} required error={errors.voucher_id?.message}>
                {(id) => (
                  <Select
                    inputId={id}
                    ariaLabel={t('vouchers.send.voucher')}
                    className="w-full"
                    searchable
                    value={field.value}
                    onChange={field.onChange}
                    options={[{ value: 0, label: s.vouchersLoading ? t('vouchers.send.loading') : t('vouchers.send.pickVoucher') }, ...s.vouchers.map((v) => ({ value: v.id, label: v.type === 'code' ? `${v.title} · ${v.code}` : v.title }))]}
                  />
                )}
              </Field>
            )}
          />
          <ErrorText error={s.vouchersError} />
          {s.voucher && <VoucherStub voucher={s.voucher} />}
          {!s.vouchersLoading && s.vouchers.length === 0 && !s.vouchersError && <p className="text-sm text-muted-foreground">{t('vouchers.send.noActive')}</p>}
        </section>

        <section className={SECTION}>
          <div className="space-y-0.5">
            <h2 className="text-sm font-semibold">{t('vouchers.send.sectionRecipients')}</h2>
            <p className="text-xs text-muted-foreground">{t('vouchers.send.recipientsDescription', { max: MAX_RECIPIENTS })}</p>
          </div>
          <div className="grid items-start gap-5 xl:grid-cols-2">
            <Controller
              control={control}
              name="phones_text"
              render={({ field }) => (
                <Field label={t('vouchers.send.phones')} hint={t('vouchers.send.phonesHint')} error={errors.phones_text?.message}>
                  {(id) => <Textarea id={id} rows={7} placeholder={t('vouchers.send.phonesPlaceholder')} invalid={!!errors.phones_text} spellCheck={false} value={field.value} onChange={field.onChange} onBlur={field.onBlur} />}
                </Field>
              )}
            />
            <div className="min-w-0 space-y-2">
              <Field label={t('vouchers.send.customers')} hint={t('vouchers.send.customersHint')}>
                {(id) => <Input id={id} type="search" autoComplete="off" maxLength={64} placeholder={t('vouchers.send.customersPlaceholder')} value={s.search} onChange={(e) => s.setSearch(e.target.value)} />}
              </Field>
              <ErrorText error={s.searchError} />
              {s.search.trim() !== '' && (
                <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border" aria-label={t('vouchers.send.customers')}>
                  {s.found.length === 0 && <li className="px-4 py-3 text-sm text-muted-foreground">{s.searching ? t('vouchers.send.searching') : t('vouchers.send.noCustomers')}</li>}
                  {s.found.map((c) => {
                    const chosen = s.picked.some((p) => p.id === c.id);
                    return (
                      <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{c.name || c.username}</span>
                          <span className="block text-xs text-muted-foreground">{c.phone}</span>
                        </span>
                        <Button className="inline-flex shrink-0 items-center gap-1" disabled={chosen} onClick={() => s.pick({ id: c.id, name: c.name || c.username, phone: c.phone })}>
                          <Plus className="size-4" aria-hidden /> {chosen ? t('vouchers.send.added') : t('vouchers.send.add')}
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}
              {s.picked.length > 0 && (
                <ul className="flex flex-wrap gap-1.5" aria-label={t('vouchers.send.picked')}>
                  {s.picked.map((c) => (
                    <li key={c.id} className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 py-1 pr-1 pl-3 text-xs">
                      {c.name} · {c.phone}
                      <button type="button" onClick={() => s.unpick(c.id)} aria-label={t('vouchers.send.remove', { name: c.name })} className="grid size-5 place-items-center rounded-full hover:bg-accent">
                        <X className="size-3" aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          {(s.summary.invalid.length > 0 || s.summary.duplicates > 0) && (
            <div className="space-y-1 rounded-xl bg-muted/60 px-4 py-3 text-xs" aria-live="polite">
              {s.summary.duplicates > 0 && <p>{t('vouchers.send.duplicates', { count: s.summary.duplicates })}</p>}
              {s.summary.invalid.length > 0 && (
                <p className="text-destructive">
                  {t('vouchers.send.invalidList', { count: s.summary.invalid.length })}{' '}
                  <span className="font-mono">{s.summary.invalid.slice(0, 5).join(', ')}{s.summary.invalid.length > 5 ? '…' : ''}</span>
                </p>
              )}
            </div>
          )}
        </section>
      </div>

      <div className="min-w-0 space-y-5 lg:sticky lg:top-24">
        <section className={SECTION}>
          <h2 className="text-sm font-semibold">{t('vouchers.send.sectionSend')}</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-muted-foreground">{t('vouchers.send.voucher')}</dt>
              <dd className="min-w-0 truncate text-right font-medium">{s.voucher?.title ?? '–'}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-muted-foreground">{t('vouchers.send.recipients')}</dt>
              <dd className="font-medium tabular-nums">{s.total}</dd>
            </div>
          </dl>
          <Button type="submit" variant="primary" className="inline-flex w-full items-center justify-center gap-2" disabled={s.sending || s.total === 0 || !s.voucher}>
            <Send className="size-4" aria-hidden /> {t('vouchers.send.submit', { count: s.total })}
          </Button>
          <ErrorText error={s.error} />
        </section>

        {s.result && (
          <section className={SECTION} aria-live="polite">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <CheckCircle2 className="size-5 text-emerald-600" aria-hidden /> {t('vouchers.send.resultTitle')}
            </h2>
            <dl className="space-y-2 text-sm">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-muted-foreground">{t('vouchers.history.targeted')}</dt>
                <dd className="font-medium tabular-nums">{s.result.target_count}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-muted-foreground">{t('vouchers.history.injected')}</dt>
                <dd><Badge tone="good" size="xs">{s.result.injected_count}</Badge></dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-muted-foreground">{t('vouchers.history.skipped')}</dt>
                <dd className="font-medium tabular-nums">{skippedTotal(s.result)}</dd>
              </div>
            </dl>
            {skippedReasons.length > 0 && (
              <ul className="space-y-1.5 text-xs">
                {skippedReasons.map(([reason, n]) => (
                  <li key={reason} className="flex items-center justify-between gap-3 rounded-lg bg-muted/60 px-3 py-2">
                    <span>{t(`vouchers.skipReason.${reason}`, { defaultValue: reason })}</span>
                    <Badge tone="warn" size="xs">{n}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </form>
  );
}
