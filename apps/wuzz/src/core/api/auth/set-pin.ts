import request from "@http/request";
import { API_V1, apiUrl } from "@http/url";
import { SetPinBodyParams, SetPinResponse } from "./set-pin.types";

/** Sets, or replaces, the signed-in customer's PIN. */
export const setPin = (data: SetPinBodyParams): Promise<SetPinResponse> =>
    request(apiUrl(`${API_V1}/pin`), {
        method: "PUT",
        data
    });
