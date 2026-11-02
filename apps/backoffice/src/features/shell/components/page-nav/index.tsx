import { Link } from '@tanstack/react-router';
import { ArrowLeft, Home } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Breadcrumb, type Crumb, usePageBackSlot } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';

/** Where a link goes: a path of the app, and the values of its `$params`. */
export type NavTarget = { to: string; params?: Record<string, string> };

/**
 * What belongs to a page that is one level into another (a record, a form): the breadcrumb above the title, from the dashboard
 * down to this page, and a round back button to the page it came from, drawn left of the title (it is portalled into `Page`'s slot). `trail` lists the pages in between and `current` is
 * this page's own name.
 */
export function PageNav({ back, backLabel, trail, current, inline = false }: { back: NavTarget; backLabel: string; trail: (NavTarget & { label: string })[]; current: string; inline?: boolean }) {
  const { t } = useTranslation();
  const go = (target: NavTarget) => (className: string, children: React.ReactNode) => (
    <Link to={target.to as never} params={target.params as never} className={className}>
      {children}
    </Link>
  );
  const items: Crumb[] = [
    { label: <Home className="size-3.5" aria-label={t('nav.dashboard')} />, link: (c) => go({ to: '/' })(c, <Home className="size-3.5" aria-label={t('nav.dashboard')} />) },
    ...trail.map((x) => ({ label: x.label, link: (c: string) => go(x)(c, x.label) })),
    { label: current },
  ];

  const slot = usePageBackSlot();
  const backButton = (
    <Link
      to={back.to as never}
      params={back.params as never}
      title={backLabel}
      aria-label={backLabel}
      className="grid size-11 shrink-0 place-items-center rounded-full border border-input bg-card text-foreground transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none"
    >
      <ArrowLeft className="size-5" aria-hidden />
    </Link>
  );

  // `inline`: for a page that is not drawn by `Page` (the outlet pages draw their title over a map): the button sits in front of the breadcrumb.
  if (inline) {
    return (
      <div className="flex items-center gap-3">
        {backButton}
        <Breadcrumb items={items} label={t('nav.breadcrumb')} />
      </div>
    );
  }

  return (
    <>
      <Breadcrumb items={items} label={t('nav.breadcrumb')} />
      {slot && createPortal(backButton, slot)}
    </>
  );
}
