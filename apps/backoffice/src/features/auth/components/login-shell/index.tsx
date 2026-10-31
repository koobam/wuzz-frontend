import { useEffect, useState, type ReactNode } from 'react';

export type LoginSlide = { image: string; text: string };

const SLIDE_MS = 6000;

/**
 * The sign-in page's frame: a photograph filling the panel, a line of copy over it with a progress bar per slide, and the
 * form in a white card floating at the right. The pictures are decoration only: without them (offline, or a failed
 * download) the panel is a plain dark one and the form works the same. Under `lg` the photograph is just a backdrop.
 */
export function LoginShell({ slides, children }: { slides: LoginSlide[]; children: ReactNode }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setTimeout(() => setActive((n) => (n + 1) % slides.length), SLIDE_MS);
    return () => clearTimeout(timer);
  }, [active, slides.length]);

  return (
    <div className="min-h-dvh bg-[oklch(0.93_0_0)] p-3 sm:p-4 dark:bg-black">
      <div className="relative mx-auto flex min-h-[calc(100dvh-1.5rem)] max-w-[110rem] overflow-hidden rounded-[2rem] bg-neutral-900 sm:min-h-[calc(100dvh-2rem)]">
        {slides.map((slide, i) => (
          <div
            key={slide.image}
            aria-hidden
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 motion-reduce:transition-none ${i === active ? 'opacity-100' : 'opacity-0'}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          />
        ))}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

        <div className="relative z-10 hidden flex-1 flex-col justify-end gap-6 p-10 text-white lg:flex xl:p-14">
          <span aria-hidden className="text-7xl leading-none font-serif">“</span>
          <p className="max-w-2xl text-3xl leading-snug font-semibold">{slides[active]?.text}</p>
          <div className="flex gap-2 pr-[28rem]" aria-hidden>
            {slides.map((slide, i) => (
              <span key={slide.image} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
                <span
                  key={i === active ? `on-${active}` : `off-${i}`}
                  className={`block h-full rounded-full bg-white ${i < active ? 'w-full' : i === active ? 'animate-[slide-fill_6s_linear_both] motion-reduce:w-full' : 'w-0'}`}
                />
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex w-full items-center justify-center p-3 lg:absolute lg:inset-y-0 lg:right-0 lg:w-auto lg:p-4">
          <div className="flex w-full max-w-md flex-col rounded-3xl border border-border bg-card p-8 lg:h-full lg:w-[26rem]">{children}</div>
        </div>
      </div>
    </div>
  );
}
