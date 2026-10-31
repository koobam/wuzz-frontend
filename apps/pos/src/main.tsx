import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/core/utils/i18n';
import { App } from '@/app';
import { i18n } from '@/core/utils/i18n';
import { ErrorBoundary, initSentry } from '@/core/utils/sentry';
import '@/styles/entry.css';

initSentry();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* A render error shows this instead of a blank page, and is reported. */}
    <ErrorBoundary
      fallback={
        <div className="p-6 text-sm">{i18n.t('app.renderError')}</div>
      }
    >
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

// The POS is online-only. An earlier version installed a service worker that kept the app on the device to load with no connection;
// a till that still has it gets it removed here, with its cache. Safe to delete once every till has opened this version.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => Promise.all(registrations.map((r) => r.unregister())))
      .then(() => caches.keys())
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('wuzz-pos-')).map((k) => caches.delete(k))))
      .catch(() => undefined);
  });
}
