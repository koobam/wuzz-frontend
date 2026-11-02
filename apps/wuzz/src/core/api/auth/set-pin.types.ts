import { ApiResponse, ErrorResponse } from "@http/response";

export interface SetPinBodyParams {
    pin: string;
}

export type SetPinResponse = ApiResponse<unknown>;

export type SetPinErrorResponse = ErrorResponse<SetPinBodyParams>;
