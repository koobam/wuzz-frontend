import { ApiResponse, ErrorResponse } from "@http/response";
import { VerifyOtpDataResponse } from "./verify-otp.types";

export interface LoginPinBodyParams {
    phone: string;
    pin: string;
}

/** The same session a verified code gives. */
export type LoginPinResponse = ApiResponse<VerifyOtpDataResponse>;

export type LoginPinErrorResponse = ErrorResponse<LoginPinBodyParams>;
