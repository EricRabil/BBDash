import { AxiosResponse } from "axios";
import CookieIntegration from "../structs/cookie-integration";

export default class AxiosCookieIntegration extends CookieIntegration {
    /**
     * Stores cookies from an Axios response to the cookie jar.
     * @param res response to store cookies from
     */
    async storeCookies(res: AxiosResponse) {
        if (res.headers && res.headers['set-cookie'] && res.config.url) {
            const cookies: string[] = Array.isArray(res.headers['set-cookie']) ? res.headers['set-cookie'] : [res.headers['set-cookie']]
            
            const url = new URL(res.config.url)

            if (url.host === this.api.instanceHost) {
                // The cookie host is the same as our Blackboard instance, store them to the jar.
                await Promise.all(cookies.map(cookie => this.jar.setCookie(cookie, this.api.instanceOrigin)))
            }
        }

        await this.manager.cookiesChangedHook();

        return res
    }
}