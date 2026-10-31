import { AlertCircle, ImageOff, RotateCcw, UploadCloud, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button, cn, ZoomableImage } from '@wuzz/web-ui';
import { IMAGE_TYPES, type UploadFolder } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { isShownImage } from '@/features/outlets/utils/outlet-form.schema';
import { useBannerImageUpload } from '../../hooks/use-banner-image-upload';
import { BANNER_RATIO } from '../../utils/banner-form.schema';

/**
 * The banner's picture: one drop zone at the carousel's proportions (drop a file on it or choose one). Once there is a picture
 * it fills the zone, opens the viewer when clicked, and can be replaced or removed; a file going up shows its progress over it.
 */
export function BannerImage({ value, onChange, error, title = '', onUploadingChange, folder = 'banners', ratio = BANNER_RATIO }: { value: string; onChange: (url: string) => void; error?: string; title?: string; onUploadingChange?: (uploading: boolean) => void; folder?: UploadFolder; ratio?: { width: number; height: number } }) {
  const { t } = useTranslation();
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const up = useBannerImageUpload(onChange, folder);
  useEffect(() => onUploadingChange?.(up.uploading), [up.uploading, onUploadingChange]);
  const shown = isShownImage(value) ? value : '';
  const problem = up.notice ?? error;
  const percent = Math.round((up.pending?.progress ?? 0) * 100);
  const radius = 18;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="space-y-3">
      <div
        role="group"
        aria-label={t('banners.form.sectionImage')}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          up.pick(e.dataTransfer.files[0]);
        }}
        style={{ aspectRatio: `${ratio.width} / ${ratio.height}` }}
        className={cn(
          'relative w-full overflow-hidden rounded-2xl border-2 transition-colors',
          shown && !over ? 'border-solid border-border bg-muted' : 'border-dashed',
          over ? 'border-solid border-foreground bg-accent' : !shown && 'border-input bg-muted/30',
          problem && !over && 'border-destructive/60',
        )}
      >
        {shown ? (
          <>
            <ImageOff className="absolute inset-0 m-auto size-6 text-muted-foreground" aria-hidden />
            <ZoomableImage src={shown} alt={title} wrapperClassName="absolute inset-0 block h-full w-full rounded-none" className="h-full w-full object-cover" />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <span className={cn('grid size-14 place-items-center rounded-full', over ? 'bg-ink text-background' : 'bg-muted text-muted-foreground')}>
              <UploadCloud className="size-7" aria-hidden />
            </span>
            <p className="text-sm font-semibold">
              {over ? (
                t('banners.form.dropOver')
              ) : (
                <>
                  {t('banners.form.dropLead')}{' '}
                  <button type="button" onClick={() => input.current?.click()} className="rounded-sm underline decoration-muted-foreground underline-offset-4 hover:decoration-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none">
                    {t('banners.form.chooseFile')}
                  </button>
                </>
              )}
            </p>
            <p className="text-xs text-muted-foreground">{t('banners.form.dropRules', { ratio: `${ratio.width}:${ratio.height}`, mb: 5 })}</p>
          </div>
        )}

        {up.pending && (
          <div className="absolute inset-0 z-10">
            <img src={up.pending.preview} alt="" className={cn('absolute inset-0 h-full w-full object-cover', up.pending.error ? 'opacity-30' : 'opacity-50')} />
            {up.pending.error ? (
              <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/85 p-4 text-center">
                <AlertCircle className="size-5 text-destructive" aria-hidden />
                <p className="line-clamp-3 text-xs text-destructive">{up.pending.error}</p>
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => void up.retry()} className="inline-flex items-center gap-1 rounded-full border border-input bg-card px-3 py-1 text-xs hover:bg-accent">
                    <RotateCcw className="size-3" aria-hidden /> {t('banners.form.retry')}
                  </button>
                  <button type="button" onClick={up.cancel} className="rounded-full px-3 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground">
                    {t('banners.form.dismiss')}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="absolute inset-0 grid place-items-center" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={t('banners.form.uploading', { name: up.pending.name })}>
                  <div className="relative grid size-16 place-items-center rounded-full bg-background/80">
                    <svg viewBox="0 0 40 40" className="absolute inset-0 -rotate-90" aria-hidden>
                      <circle cx="20" cy="20" r={radius} fill="none" strokeWidth="3" className="stroke-muted" />
                      <circle cx="20" cy="20" r={radius} fill="none" strokeWidth="3" strokeLinecap="round" className="stroke-foreground transition-[stroke-dashoffset]" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - (up.pending.progress ?? 0))} />
                    </svg>
                    <span className="text-xs font-semibold tabular-nums">{percent}%</span>
                  </div>
                </div>
                <button type="button" onClick={up.cancel} aria-label={t('banners.form.cancelUpload')} title={t('banners.form.cancelUpload')} className="absolute top-2 right-2 grid size-8 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80">
                  <X className="size-4" aria-hidden />
                </button>
              </>
            )}
          </div>
        )}

        <input
          ref={input}
          type="file"
          accept={IMAGE_TYPES.join(',')}
          className="sr-only"
          tabIndex={-1}
          aria-label={t('banners.form.chooseFile')}
          onChange={(e) => {
            up.pick(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>

      {problem && <p role="alert" className="text-xs whitespace-pre-line text-destructive">{problem}</p>}

      {shown && !up.pending && (
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => input.current?.click()}>{t('banners.form.replaceImage')}</Button>
          <Button className="text-destructive hover:bg-destructive/10" onClick={() => onChange('')}>{t('banners.form.removeImage')}</Button>
          <span className="text-xs text-muted-foreground">{t('banners.form.imageHint', { ratio: `${ratio.width}:${ratio.height}` })}</span>
        </div>
      )}
    </div>
  );
}
