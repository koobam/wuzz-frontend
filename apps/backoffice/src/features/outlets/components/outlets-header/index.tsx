import type { ReactNode } from 'react';

/**
 * The title block of an outlet page, drawn straight on the map's bottom (the banner puts a soft scrim of the page colour under
 * it, so the text reads in light and in dark): `nav` (a way back and the breadcrumb) if the page has one, the title and its
 * description at the left, the actions at the right. No card, no border: the buttons are their own controls.
 */
export function OutletsHeader({ nav, title, description, actions }: { nav?: ReactNode; title: string; description: string; actions?: ReactNode }) {
  return (
    <div className="space-y-3">
      {nav}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="max-w-xl">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-foreground/80">{description}</p>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
