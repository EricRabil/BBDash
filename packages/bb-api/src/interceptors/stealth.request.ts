import { AxiosRequestConfig } from "axios";
import { BlackboardAPI } from "../api";

/**
 * Generates an Axios interceptor that inserts the stealth headers into an Axios request
 * @param api BlackboardAPI instance to source the headers from
 */
export function stealthRequestInterceptor(api: BlackboardAPI) {
    return async function headers(req: AxiosRequestConfig) {
        const headers = req.headers ?? (req.headers = {});

        Object.assign(headers, await api.stealthHeaders());

        return req;
    }
}