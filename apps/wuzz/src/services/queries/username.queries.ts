import { createQueryKeys } from '@lukemorales/query-key-factory';
import { checkUsernameAvailability, getUsernameSuggestions } from '@core/api/auth/username';
import type { UsernameSuggestionsParams } from '@core/api/auth/username.types';

export const usernameQueries = createQueryKeys('username', {
  suggestions: (params: UsernameSuggestionsParams) => ({
    queryKey: [params.name, params.birth_date, params.username],
    queryFn: () => getUsernameSuggestions(params),
  }),
  availability: (username: string) => ({
    queryKey: ['checkUsernameAvailability', username],
    // The server always answers a check with a 200 and the verdict in the body (free, taken, or not a valid name), so any
    // error here means the check itself could not be made (offline, a timeout, a server error) and the screen can say so.
    queryFn: () => checkUsernameAvailability(username),
  }),
});