import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { i18n } from '@/core/utils/i18n';
import type { RouterContext } from '@/router';

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />,
  notFoundComponent: () => <p>{i18n.t('common.pageNotFound')}</p>,
});
