import { useEffect } from 'react';
import { useAuthState } from '@services/hooks/utils/useAuth';
import { setDeeplinkAuthenticated } from './resolve';

/** Tells the link resolver whether anyone is logged in, and lets it carry on to a held link after login. */
export const DeeplinkAuthSync = () => {
  const { isAuthenticated } = useAuthState();
  useEffect(() => {
    setDeeplinkAuthenticated(isAuthenticated);
  }, [isAuthenticated]);
  return null;
};
