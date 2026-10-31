import type { ReactNode } from 'react';
import { ChatDock } from '@/features/chat/components/chat-dock';
import { Rail } from '../rail';
import { TopBar } from '../top-bar';

/**
 * The signed-in chrome: a rounded panel floating on the canvas. The pages scroll in a layer that fills
 * the whole panel, and the top bar and the rail float over it: content passes under the pills and shows
 * in the gaps between them, so nothing is cut off by a hard line below the bar.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ChatDock>
    <div className="h-dvh overflow-hidden bg-[oklch(0.93_0_0)] p-2 sm:p-4 dark:bg-black">
      <div className="relative mx-auto h-full max-w-[110rem] overflow-hidden rounded-[2rem] bg-canvas dark:bg-background">
        {/* The window does not scroll; this layer does. The padding keeps the content clear of the floating bars at rest. */}
        <main className="absolute inset-0 min-w-0 overflow-y-auto px-3 pt-[9.5rem] pb-3 md:pt-[5.25rem] sm:px-5 sm:pb-5 lg:pl-[5.25rem]">
          {children}
        </main>
        <TopBar />
        <Rail />
      </div>
    </div>
    </ChatDock>
  );
}
