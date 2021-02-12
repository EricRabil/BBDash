import { Cookie as ToughCookie } from "tough-cookie";
import CookieIntegration from "../structs/cookie-integration";

export default class ChromeCookieIntegration extends CookieIntegration {
    /**
     * Loads cookies from the browser into the cookie jar
     */
    async loadCookies() {
        const cookies: chrome.cookies.Cookie[] = await new Promise(resolve => chrome.cookies.getAll({
            url: `${this.api.instanceOrigin}/learn/api`
        }, cookies => resolve(cookies)));

        await this.manager.storeCookies(cookies.map(({
            domain,
            name,
            value,
            hostOnly,
            path,
            httpOnly,
            secure,
            sameSite
        }) => new ToughCookie({
            domain,
            key: name,
            value,
            hostOnly,
            expires: Infinity as any as Date,
            path,
            httpOnly,
            secure,
            sameSite
        })));
    }
}