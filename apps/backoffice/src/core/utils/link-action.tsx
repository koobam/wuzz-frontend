import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';

/**
 * A row action that goes to a page of the app: `view: { label, link: linkAction('/services/$id', { id }) }`. The shared
 * `RowActions` has no router, so it hands this the class, the icon and the label to draw the link with.
 */
export const linkAction = (to: string, params?: Record<string, string>) => ({ className, icon, label }: { className: string; icon: ReactNode; label: string }) => (
  <Link to={to as never} params={params as never} className={className} aria-label={label} title={label}>
    {icon}
  </Link>
);
