import * as Sentry from '@sentry/react';
import { env } from '@/config/env';

/**
 * Starts error reporting when VITE_SENTRY_DSN is set; with no DSN it does nothing.
 * Only errors are sent: no performance traces, no session replay, no user data.
 */
export function initSentry() {
  if (!env.VITE_SENTRY_DSN) return;
  Sentry.init({
    dsn: env.VITE_SENTRY_DSN,
    // A staging build is still a Vite "production" build, so the mode alone cannot tell the two
    // apart; the pipeline names the deployment.
    environment: env.VITE_APP_ENV ?? import.meta.env.MODE,
    release: env.VITE_RELEASE,
  });
}

export const ErrorBoundary = Sentry.ErrorBoundary;
