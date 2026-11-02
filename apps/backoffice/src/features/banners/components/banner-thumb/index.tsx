import { ImageOff } from 'lucide-react';
import { ZoomableImage } from '@wuzz/web-ui';
import type { Banner } from '@/core/api';
import { isShownImage } from '@/features/outlets/utils/outlet-form.schema';

/** A banner's picture at the carousel's proportions, opening the viewer when clicked. */
export function BannerThumb({ banner, className = 'w-28' }: { banner: Pick<Banner, 'title' | 'image_url'>; className?: string }) {
  return (
    <span className={`relative block aspect-video shrink-0 overflow-hidden rounded-lg border border-border bg-muted ${className}`}>
      <ImageOff className="absolute inset-0 m-auto size-4 text-muted-foreground" aria-hidden />
      {isShownImage(banner.image_url) && (
        <ZoomableImage src={banner.image_url} alt={banner.title} loading="lazy" wrapperClassName="absolute inset-0 block h-full w-full rounded-none" className="h-full w-full object-cover" />
      )}
    </span>
  );
}
