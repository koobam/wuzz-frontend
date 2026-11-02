import { RouterProvider } from '@tanstack/react-router';
import { useSession } from '@/services/hooks/use-session';
import { router } from '@/router';

// Holds off mounting the router until the session query's first fetch
// resolves, so `beforeLoad` guards never run against a "don't know yet"
// state and redirect someone who is actually logged in.
export function RouterWithAuth() {
  const { isBootstrapping } = useSession();
  if (isBootstrapping) return null;
  return <RouterProvider router={router} />;
}
