import request from "@http/request";
import { API_V1, apiUrl } from "@http/url";
import { LoginBodyParams, LoginResponse } from "./login.types";

/**
 * Sends a sign-in code to the phone of an existing customer. It answers the same for a number that has no account, so
 * the screen cannot tell the two apart; the code is then checked by verify-otp, which signs the customer in.
 */
export const login = (data: LoginBodyParams): Promise<LoginResponse> =>
    request(apiUrl(`${API_V1}/login`), {
        method: "POST",
        data
    });
