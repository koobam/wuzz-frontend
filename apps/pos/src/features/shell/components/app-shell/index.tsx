import { useEffect, type ReactNode } from 'react';
import { pingPresence } from '@/core/api';
import { Rail } from '../rail';
import { TopBar } from '../top-bar';

const PING_EVERY = 20_000;

/**
 * The signed-in chrome: a rounded panel floating on the canvas. The pages scroll in a layer that fills the
 * whole panel, and the top bar and the rail float over it, so nothing is cut off by a hard line below the bar.
 */
export function AppShell({ children }: { children: ReactNode }) {
  // While the till is open and visible, tell the back office so: it shows who is working right now.
  useEffect(() => {
    const ping = () => document.visibilityState === 'visible' && void pingPresence().catch(() => undefined);
    ping();
    const timer = setInterval(ping, PING_EVERY);
    document.addEventListener('visibilitychange', ping);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', ping);
    };
  }, []);

  return (
    <div className="h-dvh overflow-hidden bg-[oklch(0.93_0_0)] p-2 sm:p-4 dark:bg-black">
      <div className="relative mx-auto h-full max-w-[110rem] overflow-hidden rounded-[2rem] bg-canvas dark:bg-background">
        <main className="absolute inset-0 min-w-0 overflow-y-auto px-3 pt-[9.5rem] pb-3 md:pt-[5.25rem] sm:px-5 sm:pb-5 lg:pl-[5.25rem]">
          {children}
        </main>
        <TopBar />
        <Rail />
      </div>
    </div>
  );
}
