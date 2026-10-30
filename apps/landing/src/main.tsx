import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/core/i18n';
import { App } from '@/app';
import '@/styles/entry.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
