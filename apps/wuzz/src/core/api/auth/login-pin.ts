import request from "@http/request";
import { API_V1, apiUrl } from "@http/url";
import { LoginPinBodyParams, LoginPinResponse } from "./login-pin.types";

/** Signs a customer in with their phone number and 6-digit PIN, with no SMS code. */
export const loginWithPin = (data: LoginPinBodyParams): Promise<LoginPinResponse> =>
    request(apiUrl(`${API_V1}/login/pin`), {
        method: "POST",
        data
    });
