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

export class Throttle<Source, Result> {
    #pendingPromise: Promise<Result[]>;
    #resolve: (results: Result[]) => void;
    #reject: (error: any) => void;

    constructor(public transformer: (src: Source) => Promise<Result>, public max: number = 15) {
        this.#pendingPromise = new Promise((resolve, reject) => {
            this.#resolve = resolve;
            this.#reject = reject;
        });
    }
    
    get asPromise(): Promise<Result[]> {
        return this.#pendingPromise;
    }

    private inProgress: Set<Promise<Result>> = new Set();
    private fifoQueue: Source[] = [];
    private results: Set<Result> = new Set();

    #closed = false;
    #fired = false;

    public store(promise: Promise<Result>) {
        if (this.full) throw new Error("Throttle is full");

        this.inProgress.add(promise);
        promise.then(result => this.results.add(result)).finally(() => {
            this.inProgress.delete(promise);

            if (this.finished && !this.#fired) {
                this.#fired = true;
                this.#resolve(Array.from(this.results));
                return;
            }

            const nextItem = this.fifoQueue.shift();
            if (!nextItem) return;
            this.store(this.transformer(nextItem));
        });
    }

    public take(items: Source[]) {
        if (this.#closed) throw new Error("Throttle is closed");

        while (!this.full) {
            const item = items.shift();
            if (!item) return;
            this.store(this.transformer(item));
        }

        this.fifoQueue.push(...items);
    }

    public close() {
        this.#closed = true;
    }

    public get finished(): boolean {
        return this.empty && this.#closed;
    }

    public get empty(): boolean {
        return this.inProgress.size === 0 && this.fifoQueue.length === 0;
    }

    public get full(): boolean {
        return this.inProgress.size >= this.max;
    }
}