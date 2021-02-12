import { AxiosError } from "axios";
import BlackboardAPI from ".";
import { USER_AGENT } from "./constants";

/**
 * Inspects the given object and determines if it is an Axios error
 * @param obj object to inspect
 */
export function isAxiosError<T = any>(obj: any): obj is AxiosError<T> {
    return typeof obj === "object"
        && obj !== null
        && obj.isAxiosError === true;
}

/**
 * Generates headers to be used in an authenticated request to Blackboard
 * @param api api instance to source data from
 */
export async function makeStealthHeaders(api: BlackboardAPI) {
    const headers: Record<string, string> = {};

    let xsrf = await api.cookies.getXSRF();

    if (!xsrf) {
        await api.delegate.xsrfInvalidated();
        xsrf = await api.cookies.getXSRF();

        if (!xsrf) {
            throw new Error("Tried to get XSRF, but failed.");
        }
    }

    headers["Host"] = api.instanceHost;
    headers["Connection"] = "close";
    headers["Origin"] = api.instanceOrigin;
    headers["Prgama"] = "no-cache";
    headers["Cache-Control"] = "no-cache";
    headers["X-Blackboard-XSRF"] = xsrf;
    headers["Accept"] = "application/json, text/plain, */*";
    headers["User-Agent"] = USER_AGENT;
    headers["Sec-Fetch-Site"] = "same-origin";
    headers["Sec-Fetch-Mode"] = "cors";
    headers["Sec-Fetch-Dest"] = "empty";
    headers["Referer"] = `${api.instanceOrigin}/ultra/stream`;
    headers["Accept-Encoding"] = "gzip, deflate, br";
    headers["Accept-Language"] = "en-US,en;q=0.9";
    headers["Cookie"] = await api.cookies.jar.getCookieString(`${api.instanceOrigin}/learn/api`);

    return headers;
}