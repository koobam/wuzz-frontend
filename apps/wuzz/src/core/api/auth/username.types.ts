import { ApiResponse } from '@http/response';

export interface UsernameSuggestionsParams {
  name: string;
  username?: string;
  birth_date?: string;
}


export type UsernameSuggestionsResponse = ApiResponse<string[]>;
/** The verdict on a username: free, or not (taken, or not a valid name) with the reason. Always a 200; an error status means the check failed. */
export interface UsernameCheck {
  available: boolean;
  reason?: 'taken' | 'invalid';
  message?: string;
}

export type CheckUsernameResponse = ApiResponse<UsernameCheck>;