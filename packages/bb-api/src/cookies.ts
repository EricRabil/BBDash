import { Cookie as ToughCookie, CookieJar, Store as ToughStore } from "tough-cookie";
import { BlackboardAPI } from "./api";
import AxiosCookieIntegration from "./cookie-integrations/axios";
import ChromeCookieIntegration from "./cookie-integrations/chrome";
import PuppeteerCookieIntegration from "./cookie-integrations/puppeteer";

export interface CookieManagerOptions {
    store?: ToughStore;
}

let goingOnce = false;

/**
 * Manages the synchronization of cookies between different services. Also handles parsing of BbRouter cookie.
 */
export class CookieManager {
    public readonly jar: CookieJar;

    public constructor(public readonly api: BlackboardAPI) {
        this.jar = new CookieJar(api.options.store);

        if (api.options.noCookies) return;

        api.axios.defaults.jar = this.jar;

        api.axios.interceptors.response.use(res => this.axios.storeCookies(res));
    }

    /**
     * Returns the XSRF token, or null if it is not set.
     */
    async getXSRF(): Promise<string | null> {
        const parsed = await this.parseRouterCookie();

        const xsrf = parsed.xsrf;
    
        return xsrf || null;
    }

    /**
     * Fired when the cookies have changed.
     * 
     * Integrations should only call this if performing a direct mutation to the jar.
     */
    async cookiesChangedHook() {
        const parsed = await this.parseRouterCookie();

        const user = parsed.user;
        const lastUser = localStorage.getItem('bb-last-user');
        
        if (lastUser !== user) {
            if (this.api.delegate.userChanged) {
                await this.api.delegate.userChanged();
                localStorage.setItem('bb-last-user', (await this.parseRouterCookie()).user);
            }
        }
    }

    /**
     * Stores an array of cookies to the jar.
     * @param cookies cookies to store
     */
    async storeCookies(cookies: ToughCookie[]) {
        await Promise.all(cookies.filter(cookie => cookie.domain === this.api.instanceHost).map(cookie => this.jar.setCookie(cookie, this.api.instanceOrigin)));
        await this.cookiesChangedHook();
    }
    
    /**
     * Parses the BbRouter cookie, returning its pairs in a flat object.
     */
    private async parseRouterCookie(): Promise<Record<string, string>> {
        const cookies = await this.jar.getCookies(this.api.options.instanceURL);
        
        const cookie = cookies.find(cookie => cookie.key === "BbRouter");
    
        if (!cookie) {
            return {};
        }
    
        return cookie.value.split(",").map(str => str.split(":")).reduce((acc, [k,v]) => Object.assign(acc, { [k]:v }), {});
    }

    puppeteer = new PuppeteerCookieIntegration(this)
    axios = new AxiosCookieIntegration(this)
    chrome = new ChromeCookieIntegration(this)
}