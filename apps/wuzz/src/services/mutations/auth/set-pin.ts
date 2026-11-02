import { setPin } from "@core/api/auth/set-pin";
import { SetPinBodyParams, SetPinErrorResponse } from "@core/api/auth/set-pin.types";
import { useMutation } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

export const useSetPinMutation = () => useMutation({
    mutationFn: (payload: SetPinBodyParams) => setPin(payload),
    onError: (error: SetPinErrorResponse) => {
        Toast.show({ type: 'error', text1: error.message });
    }
});
