import { ConfirmProvider } from '@wuzz/web-ui';
import { QueryProvider } from '@/services/providers/query-provider';
import { RouterWithAuth } from '@/services/providers/router-with-auth';
import { ThemeProvider } from '@/services/providers/theme-provider';

export function App() {
  return (
    <ThemeProvider>
      <QueryProvider>
        <ConfirmProvider>
          <RouterWithAuth />
        </ConfirmProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
