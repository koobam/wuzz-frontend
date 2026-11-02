import { Link } from '@tanstack/react-router';
import { ImageOff } from 'lucide-react';
import { useState } from 'react';
import { buttonVariants, cn, ZoomableImage } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';

/**
 * An outlet's banner pictures: one large (16:9) with a strip of thumbnails that switches it. Only addresses the app can show
 * are offered, and a picture that does not load is dropped from the strip. With none, it says so and points to the edit page.
 */
export function OutletGallery({ pictures, outletId, name = '' }: { pictures: string[]; outletId: number; name?: string }) {
  const { t } = useTranslation();
  const [broken, setBroken] = useState<Set<string>>(new Set());
  const [current, setCurrent] = useState(0);
  const shown = pictures.filter((src) => !broken.has(src));
  const active = shown[Math.min(current, Math.max(shown.length - 1, 0))];
  const drop = (src: string) => setBroken((b) => new Set(b).add(src));

  if (shown.length === 0) {
    return (
      <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center">
        <div className="space-y-3">
          <ImageOff className="mx-auto size-8 text-muted-foreground" aria-hidden />
          <div>
            <p className="text-sm font-medium">{t('outlets.detail.noBannerTitle')}</p>
            <p className="text-xs text-muted-foreground">{t('outlets.detail.noBannerHint')}</p>
          </div>
          <Link to="/outlets/$id/edit" params={{ id: String(outletId) }} className={buttonVariants()}>{t('common.edit')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <ZoomableImage
          key={active}
          src={active!}
          alt={name}
          images={shown.map((src, i) => ({ src, alt: `${name} ${i + 1}` }))}
          index={shown.indexOf(active!)}
          onIndexChange={(i) => setCurrent(i)}
          wrapperClassName="block w-full rounded-2xl"
          className="aspect-video w-full rounded-2xl border border-border bg-muted object-cover"
          onError={() => active && drop(active)}
        />
        {shown.length > 1 && (
          <span className="pointer-events-none absolute right-3 bottom-3 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white tabular-nums">{shown.indexOf(active!) + 1} / {shown.length}</span>
        )}
      </div>
      {shown.length > 1 && (
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {shown.map((src, i) => (
            <li key={src} className="shrink-0">
              <button
                type="button"
                onClick={() => setCurrent(i)}
                aria-label={t('outlets.detail.picture', { n: i + 1 })}
                aria-current={src === active}
                className={cn('block overflow-hidden rounded-xl border-2 transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none', src === active ? 'border-ink' : 'border-transparent opacity-70 hover:opacity-100')}
              >
                <img src={src} alt="" loading="lazy" className="h-16 w-24 object-cover" onError={() => drop(src)} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
