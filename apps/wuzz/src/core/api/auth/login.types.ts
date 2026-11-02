import { ApiResponse, ErrorResponse } from "@http/response";

export interface LoginBodyParams {
    phone: string;
    /** Asks for an SMS code even when the customer has a PIN (for "Lupa PIN"). */
    force_otp?: boolean;
}

/** How this sign-in goes on: the customer types their PIN, or the code just sent to their phone. */
export type LoginMethod = "pin" | "otp";

export interface LoginDataResponse {
    phone: string;
    method: LoginMethod;
    expired_at: string;
}

export type LoginResponse = ApiResponse<LoginDataResponse>;

export type LoginErrorResponse = ErrorResponse<LoginBodyParams>;
