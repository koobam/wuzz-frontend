import { ZoomIn } from 'lucide-react';
import { useState, type ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { ImageViewer, type ViewerImage } from '../image-viewer';
import { cn } from '../../utils/cn';

/**
 * A picture that opens in the viewer (zoom in and out) when clicked. It takes the `<img>` attributes (`className` is the
 * picture's), so it can replace an `<img>` one for one; `wrapperClassName` shapes the button around it. Give `images` and
 * `index` to let the viewer step through a set (`onIndexChange` reports where it went); alone it shows just itself.
 * A picture that does not load is not drawn at all.
 */
export function ZoomableImage({
  src,
  alt = '',
  className,
  wrapperClassName,
  images,
  index = 0,
  onIndexChange,
  onError,
  ...rest
}: Omit<ComponentProps<'img'>, 'src'> & { src: string; wrapperClassName?: string; images?: ViewerImage[]; index?: number; onIndexChange?: (i: number) => void }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const [at, setAt] = useState(index);
  if (failed) return null;

  const set = images && images.length > 0 ? images : [{ src, alt }];
  const start = images ? index : 0;
  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setAt(start);
          setOpen(true);
        }}
        aria-label={alt ? t('viewer.zoomImageNamed', { name: alt }) : t('viewer.zoomImage')}
        title={t('viewer.zoomImage')}
        className={cn('group/zoom relative inline-block cursor-zoom-in overflow-hidden rounded-[inherit] focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none', wrapperClassName)}
      >
        <img {...rest} src={src} alt={alt} className={className} onError={(e) => { setFailed(true); onError?.(e); }} />
        <span className="pointer-events-none absolute inset-0 grid place-items-center bg-black/0 text-white opacity-0 transition group-hover/zoom:bg-black/25 group-hover/zoom:opacity-100 group-focus-visible/zoom:bg-black/25 group-focus-visible/zoom:opacity-100">
          <ZoomIn className="size-5" aria-hidden />
        </span>
      </button>
      <ImageViewer
        open={open}
        images={set}
        index={images ? at : 0}
        onIndexChange={(i) => {
          setAt(i);
          onIndexChange?.(i);
        }}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
