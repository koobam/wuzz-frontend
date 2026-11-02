import { z } from 'zod';

const schema = z.object({
  VITE_API_URL: z.string().url(),
  // wuzz-support (Phoenix): REST history at /api, websocket at /socket.
  VITE_SUPPORT_URL: z.string().url(),
  VITE_SENTRY_DSN: z.string().optional(),
  // Which deployment this build is (staging, production), and which commit. Sentry groups
  // and filters by them; without VITE_APP_ENV it falls back to the Vite mode.
  VITE_APP_ENV: z.string().optional(),
  VITE_RELEASE: z.string().optional(),
});

// Fails fast on a missing/invalid VITE_API_URL instead of surfacing as a
// confusing runtime fetch error the first time something calls the API.
export const env = schema.parse(import.meta.env);
