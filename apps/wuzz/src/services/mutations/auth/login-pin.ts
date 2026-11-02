import { loginWithPin } from "@core/api/auth/login-pin";
import { LoginPinBodyParams, LoginPinErrorResponse } from "@core/api/auth/login-pin.types";
import { useMutation } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

export const useLoginPinMutation = () => useMutation({
    mutationFn: (payload: LoginPinBodyParams) => loginWithPin(payload),
    onError: (error: LoginPinErrorResponse) => {
        Toast.show({ type: 'error', text1: error.message });
    }
});
