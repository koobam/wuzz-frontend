import { login } from "@core/api/auth/login";
import { LoginBodyParams, LoginErrorResponse } from "@core/api/auth/login.types";
import { useMutation } from "@tanstack/react-query"
import Toast from "react-native-toast-message";

export const useLoginMutation = () => useMutation({
    mutationFn: (payload: LoginBodyParams) => login(payload),
    onError: (error: LoginErrorResponse) => {
        Toast.show({ type: 'error', text1: error.message });
    }
});
