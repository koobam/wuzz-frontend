import { createContext, useContext, useState, type ReactNode } from 'react';

/** Where a page's back button is drawn: the spot left of the title. `Page` provides it; a `nav` fills it through a portal. */
const BackSlotContext = createContext<HTMLElement | null>(null);
export const usePageBackSlot = () => useContext(BackSlotContext);

/** The frame of a page: the breadcrumb above, then the title (with the back button at its left), an optional line under it, actions at the right, then the content. */
export function Page({
  nav,
  title,
  subtitle,
  actions,
  beside,
  children,
}: {
  /** Above the title: where the page is (a breadcrumb); it may also put the way back in the slot left of the title (see `usePageBackSlot`). */
  nav?: ReactNode;
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  /** Sits right next to the title (a period picker, say); `actions` stay at the far right. */
  beside?: ReactNode;
  children: ReactNode;
}) {
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  return (
    <BackSlotContext.Provider value={slot}>
      <div className="space-y-4">
        {nav}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <div className="flex items-center gap-3">
              <div ref={setSlot} className="shrink-0 empty:hidden" />
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
                {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
              </div>
            </div>
            {beside}
          </div>
          {actions}
        </div>
        <div className="space-y-5">{children}</div>
      </div>
    </BackSlotContext.Provider>
  );
}
