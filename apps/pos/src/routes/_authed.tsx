import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { AppShell } from '@/features/shell';
import { isAuthenticatedIn } from '@/services/hooks/use-session';

/**
 * Pathless layout route: everything nested under `_authed/` requires a
 * session. The guard runs before any child loader, so protected data is
 * never fetched for an anonymous visitor.
 */
export const Route = createFileRoute('/_authed')({
  beforeLoad: ({ context, location }) => {
    if (!isAuthenticatedIn(context.queryClient)) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
