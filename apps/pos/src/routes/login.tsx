import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';
import { LoginPage } from '@/pages/(auth)/login';
import { isAuthenticatedIn } from '@/services/hooks/use-session';

const LoginSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute('/login')({
  validateSearch: LoginSearchSchema,
  beforeLoad: ({ context, search }) => {
    if (isAuthenticatedIn(context.queryClient)) {
      throw redirect({ to: search.redirect ?? '/' });
    }
  },
  component: LoginPage,
});
