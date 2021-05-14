import Axios, { AxiosInstance } from "axios";
import axiosCookieJarSupport from "axios-cookiejar-support";
import { USER_AGENT } from "./constants";
import { CookieManager, CookieManagerOptions } from "./cookies";
import { stealthRequestInterceptor } from "./interceptors/stealth.request";
import { CourseLayer } from "./layers/courses";
import { GradesLayer } from "./layers/grades";
import { StreamLayer } from "./layers/stream";
import { UsersLayer } from "./layers/users";
import { isAxiosError, makeStealthHeaders } from "./util";

export interface BlackboardAPIDelegate {
    /**
     * Fired when the XSRF token was invalidated and must be renewed. This shouldn't happen in a chrome extension.
     */
    xsrfInvalidated(): Promise<void>;
    /**
     * Fired when the user must re-login.
     */
    relogin(): Promise<void>;
    /**
     * Used to query the implementation level for the userID.
     */
    userID(): string;
    /**
     * Fired when the authenticated user has changed and the userID should be refreshed.
     */
    userChanged?: () => Promise<void>;
}

export interface BlackboardAPIOptions extends CookieManagerOptions {
    /**
     * URL to the API instance
     */
    instanceURL: string;
    /**
     * Delegate for implementation-level tasks
     */
    delegate: BlackboardAPIDelegate;
    /**
     * Whether to omit stealth header injection
     */
    noStealth?: boolean;
    /**
     * Whether to omit cookie injection
     */
    noCookies?: boolean;
    /**
     * Whether the API client is running in a Blackboard process
     */
    inProcess?: boolean;
}

/**
 * Central interface for interacting with Blackboard API layers
 */
export class BlackboardAPI {
    /**
     * Customized axios client for authenticated requests
     */
    public readonly axios: AxiosInstance;

    /**
     * Cookie manager for this API instance
     */
    public readonly cookies: CookieManager;

    /**
     * Origin the Blackboard instance resides on
     * 
     * https://learn.dcollege.net
     */
    public readonly instanceOrigin: string;

    /**
     * Host the Blackboard instance resides on
     * 
     * learn.dcollege.net
     */
    public readonly instanceHost: string;

    public constructor(public readonly options: BlackboardAPIOptions) {
        const {
            origin,
            host
        } = new URL(options.instanceURL);

        this.instanceOrigin = origin;
        this.instanceHost = host;

        this.axios = Axios.create({
            baseURL: `${origin}/learn/api/v1/`
        });

        if (!options.inProcess) {
            if (!options.noCookies) axiosCookieJarSupport(this.axios);
        }

        this.cookies = new CookieManager(this);

        if (!options.noStealth) this.axios.interceptors.request.use(stealthRequestInterceptor(this));

        this.axios.interceptors.response.use(undefined, async (err) => {
            if (!isAxiosError(err) || !err.response || ![401].includes(err.response.status)) throw err;
            else {
                await this.delegate.relogin();
                return this.axios.request(err.config);
            }
        });
    }

    /**
     * Assembles the necessary headers to perform an authenticated Blackboard request
     */
    public stealthHeaders(): Promise<Record<string, string>> {
        return makeStealthHeaders(this);
    }

    /**
     * Implementation delegate for certain tasks
     */
    public get delegate() {
        return this.options.delegate;
    }

    /**
     * Currently-authenticated userID
     */
    public get userID() {
        return this.delegate.userID();
    }

    /**
     * User agent to use in authenticated Blackboard requests
     */
    public get userAgent() {
        return USER_AGENT;
    }

    /**
     * Formats a relative path against the configured API origin
     * @param path path to format
     */
    public formatURL(path: string): string {
        return new URL(path, this.instanceOrigin).toString();
    }

    public stream = new StreamLayer(this)
    public courses = new CourseLayer(this)
    public users = new UsersLayer(this)
    public grades = new GradesLayer(this)
}