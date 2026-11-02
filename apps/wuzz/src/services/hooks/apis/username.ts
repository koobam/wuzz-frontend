import { UsernameSuggestionsParams } from "@core/api/auth/username.types";
import { usernameQueries } from "@services/queries/username.queries";
import { useQuery } from "@tanstack/react-query";

interface UseUsernameSuggestionsParams {
    fullName: string;
    username?: string;
    birthDate?: string | null;
}

export const useUsernameSuggestions = ({
    fullName,
    username,
    birthDate,
}: UseUsernameSuggestionsParams) => {
    const params: UsernameSuggestionsParams = {
        name: fullName,
        username: username || undefined,
        birth_date: birthDate || undefined,
    };
    return useQuery({
        ...usernameQueries.suggestions(params),
        enabled: (username?.trim()?.length ?? 0) >= 2,
        select: (data) => data?.data ?? [],
    });
};

export const useCheckUsernameAvailability = (username: string, enabled = true) => {
    return useQuery({
        ...usernameQueries.availability(username),
        enabled: enabled && username.trim().length >= 2,
        gcTime: 30 * 1000, // 5 minutes
        select: (data) => data?.data?.available ?? false,
    });
}