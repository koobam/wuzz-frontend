import { env } from '@/config/env';

export type AppEnv = 'production' | 'staging' | 'development';

/**
 * Which deployment this build is. The pipeline names a staging build (VITE_APP_ENV), because
 * staging is still a Vite "production" build; otherwise the Vite mode says: a dev server is
 * development, a build is production. Anything else (a name nobody asked for) is no badge.
 */
export function appEnv(): AppEnv | null {
  const name = env.VITE_APP_ENV ?? import.meta.env.MODE;
  return name === 'production' || name === 'staging' || name === 'development' ? name : null;
}

/** What an environment badge shows: its tone and the translation key of the environment's name; null when there is nothing to show. */
export function envBadge(): { tone: 'info' | 'warn' | 'bad'; label: string } | null {
  const name = appEnv();
  if (!name) return null;
  return { tone: { development: 'info', staging: 'warn', production: 'bad' }[name] as 'info' | 'warn' | 'bad', label: `env.${name}` };
}
