import { z } from 'zod';

const schema = z.object({
  VITE_API_URL: z.string().url(),
  // wuzz-support (Phoenix): the team chat's REST at /api and websocket at /socket.
  VITE_SUPPORT_URL: z.string().url(),
  VITE_SENTRY_DSN: z.string().optional(),
  // Which deployment this build is (staging, production), and which commit. Sentry groups
  // and filters by them; without VITE_APP_ENV it falls back to the Vite mode.
  VITE_APP_ENV: z.string().optional(),
  VITE_RELEASE: z.string().optional(),
  // The URL scheme of the customer app this backoffice manages (wuzz in production, wuzz-stg in staging). The server builds the
  // real banner link with its own APP_DEEPLINK_SCHEME; this only draws the preview before a banner is saved, so keep them equal.
  VITE_APP_SCHEME: z
    .string()
    .regex(/^[a-z][a-z0-9+.-]*$/)
    .default('wuzz'),
});

// Fails fast on a missing/invalid VITE_API_URL instead of surfacing as a
// confusing runtime fetch error the first time something calls the API.
export const env = schema.parse(import.meta.env);
