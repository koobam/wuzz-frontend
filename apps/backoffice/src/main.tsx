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
        <div className="p-6 text-sm">
          {i18n.t('common.unexpectedError')}
        </div>
      }
    >
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
