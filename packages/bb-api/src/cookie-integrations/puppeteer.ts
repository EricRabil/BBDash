import { Page } from "puppeteer";
import { Cookie as ToughCookie } from "tough-cookie";
import CookieIntegration from "../structs/cookie-integration";

export default class PuppeteerCookieIntegration extends CookieIntegration {
    /**
     * Stores all relevant cookies in the persistent jar
     * @param page page to capture cookies from
     */
    async storeCookies(page: Page) {
        const cookies = await page.cookies();

        await this.manager.storeCookies(cookies.map(({
            name: key,
            value,
            domain,
            path,
            httpOnly,
            secure,
            sameSite
        }) => new ToughCookie({
            key,
            value,
            domain,
            path,
            httpOnly,
            secure,
            sameSite
        })));
    }

    /**
     * Loads cookies from the cookie jar into a page
     * @param page page to load cookies into
     */
    async loadCookies(page: Page) {
        const cookies = await this.jar.getCookies(this.api.instanceOrigin);

        const setCookies = cookies.map(({
            key: name,
            value,
            domain,
            path,
            httpOnly,
            secure,
            sameSite
        }) => ({
            name,
            value,
            domain: domain || undefined,
            path: path || undefined,
            httpOnly,
            secure,
            sameSite: sameSite as "Strict" | "Lax"
        }));

        await page.setCookie(...setCookies);
    }
}