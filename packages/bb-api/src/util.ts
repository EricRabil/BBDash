import { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import BlackboardAPI from ".";
import { USER_AGENT } from "./constants";
import { BatchResponse } from "./structs/layer";

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
        xsrf = await api.cookies.getXSRF();

        if (!xsrf) {
            throw new Error("Tried to get XSRF, but failed.");
        }
    }

    headers["X-Blackboard-XSRF"] = xsrf;

    if (!api.options.inProcess) {
        headers["Host"] = api.instanceHost;
        headers["Connection"] = "close";
        headers["Origin"] = api.instanceOrigin;
        headers["Prgama"] = "no-cache";
        headers["Cache-Control"] = "no-cache";
        headers["Accept"] = "application/json, text/plain, */*";
        headers["User-Agent"] = USER_AGENT;
        headers["Sec-Fetch-Site"] = "same-origin";
        headers["Sec-Fetch-Mode"] = "cors";
        headers["Sec-Fetch-Dest"] = "empty";
        headers["Referer"] = `${api.instanceOrigin}/ultra/stream`;
        headers["Accept-Encoding"] = "gzip, deflate, br";
        headers["Accept-Language"] = "en-US,en;q=0.9";
        headers["Cookie"] = await api.cookies.jar.getCookieString(`${api.instanceOrigin}/learn/api`);
    }

    return headers;
}

export class Throttle<Source, Result> {
    #pendingPromise: Promise<Result[]>;
    #resolve: (results: Result[]) => void;

    constructor(public transformer: (src: Source) => Promise<Result>, public max: number = 5) {
        this.#pendingPromise = new Promise(resolve => this.#resolve = resolve);
    }
    
    get asPromise(): Promise<Result[]> {
        return this.#pendingPromise;
    }

    private inProgress: Set<Promise<Result>> = new Set();
    private fifoQueue: Source[] = [];
    private results: Set<Result> = new Set();

    #closed = false;
    #fired = false;

    public async store(promise: Promise<Result>) {
        if (this.full) throw new Error("Throttle is full");

        this.inProgress.add(promise);
        
        try {
            this.results.add(await promise);
        } finally {
            this.inProgress.delete(promise);

            if (this.finished && !this.#fired) {
                this.#fired = true;
                this.#resolve(Array.from(this.results));
                return;
            }

            const nextItem = this.fifoQueue.shift();
            if (!nextItem) return;
            this.store(this.transformer(nextItem));
        }
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

export class SharedThrottle {
    constructor(public maxConcurrent: number) {}
    
    #pending: Set<Promise<any>> = new Set();;
    #fifoQueue: (() => Promise<any>)[] = [];
    #resolutions: Map<() => Promise<any>, [(value: any) => void, (err: any) => void]> = new Map();

    public static sharedInstance: SharedThrottle = new SharedThrottle(3);

    public async runNow<T>(generator: () => Promise<T>) {
        const promise = generator();
        this.#pending.add(promise);

        let result: T, finished = false;

        try {
            result = await promise;
            finished = true;
        } catch (e) {
            this.reject(generator, e);
        }

        if (finished) this.resolve(generator, result!);

        this.#pending.delete(promise);

        const nextItem = this.#fifoQueue.shift();
        if (!nextItem) return;
        this.runNow(nextItem);
    }

    public resolve<T>(generator: () => Promise<T>, value: T) {
        if (!this.#resolutions.has(generator)) throw new Error("Mismatched resolution");
        this.#resolutions.get(generator)![0](value);
        this.#resolutions.delete(generator);
    }

    public reject<T>(generator: () => Promise<T>, err: any) {
        if (!this.#resolutions.has(generator)) throw new Error("Mismatched resolution");
        this.#resolutions.get(generator)![1](err);
        this.#resolutions.delete(generator);
    }

    public async process<T>(items: Array<() => Promise<T>>): Promise<T[]> {
        const promises = items.map(item => new Promise<T>((resolve, reject) => this.#resolutions.set(item, [resolve, reject])));

        while (!this.full) {
            const item = items.shift();
            if (!item) break;
            this.runNow(item);
        }

        this.#fifoQueue.push(...items);

        return Promise.all(promises);
    }

    public async processOne<T>(item: () => Promise<T>): Promise<T> {
        return this.process([ item ]).then(([ result ]) => result);
    }

    public get full(): boolean {
        return this.#pending.size >= this.maxConcurrent;
    }
}

export interface BatchRequest {
    method: RequestMethod;
    relativeUrl: string;
}

type RequestMethod = "GET" | "DELETE" | "POST" | "PUT" | "PATCH";

const swizzleKeys: Array<"get" | "delete" | "post" | "put" | "patch"> = ["get", "delete", "post", "put", "patch"];

type MethodStorage = Partial<AxiosInstance>;

const methodStorage: Map<AxiosInstance, MethodStorage> = new Map();

function backupAxios(axios: AxiosInstance) {
    const storage: MethodStorage = {};

    swizzleKeys.forEach(<K extends keyof AxiosInstance>(key: K) => {
        storage[key] = axios[key];
    });

    methodStorage.set(axios, storage);
}

function restoreAxios(axios: AxiosInstance) {
    if (!methodStorage.has(axios)) throw new Error("Axios was restored without being patched");

    const storage = methodStorage.get(axios)!;

    swizzleKeys.forEach(<K extends keyof AxiosInstance>(key: K) => {
        if (!storage[key]) return;
        axios[key] = storage[key] as any;
    });
}

function patchAxios(axios: AxiosInstance, addRequest: (req: BatchRequest) => Promise<any>) {
    if (!methodStorage.has(axios)) backupAxios(axios);

    swizzleKeys.forEach(key => {
        axios[key] = function<T = any, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
            return addRequest({
                relativeUrl: url,
                method: key.toUpperCase() as unknown as RequestMethod
            })
        }
    });
}

interface DetachedPromise<T = any> {
    resolve(arg0: T): void;
    reject(err: any): void;
}

class _AxiosError extends Error implements AxiosError {
    config: AxiosRequestConfig;
    code?: string | undefined;
    request?: any;
    response?: AxiosResponse<any> | undefined;
    
    isAxiosError: boolean = true;
    toJSON() {
        return {}
    }
}

export class APIBatcher {
    #requests: Array<BatchRequest> = [];
    #resolutions: Map<BatchRequest, DetachedPromise> = new Map();

    constructor(public axios: AxiosInstance) {

    }

    createDetachedPromise<T = any>(req: BatchRequest): Promise<T> {
        this.#requests.push(req);
        
        return new Promise((resolve, reject) => {
            this.#resolutions.set(req, {
                resolve,
                reject
            });
        });
    }

    private resolve(index: number, resolution: AxiosResponse) {
        const [ request ] = this.#requests.splice(index, 1);
        const { resolve } = this.#resolutions.get(request)!;

        resolve(resolution);

        this.#resolutions.delete(request);
    }

    private reject(index: number, err: AxiosError) {
        const [ request ] = this.#requests.splice(index, 1);
        const { reject } = this.#resolutions.get(request)!;

        reject(err);

        this.#resolutions.delete(request);
    }

    openContext() {
        patchAxios(this.axios, req => this.createDetachedPromise(req));
    }

    closeContext() {
        restoreAxios(this.axios);
    }

    async send() {
        restoreAxios(this.axios);
        
        const { data } = await this.axios.put<BatchResponse<any>[]>("/utilities/batch?xb=1", this.#requests);

        data.forEach(({ body, headers, statusCode }, index) => {
            const response: AxiosResponse = {
                data: body,
                status: statusCode,
                statusText: statusCode.toString(),
                headers,
                config: {}
            };

            if (statusCode < 400) {
                this.resolve(index, response);
            } else {
                const err = new _AxiosError();

                err.config = {};
                err.code = statusCode.toString();
                err.response = response;

                this.reject(index, err);
            }
        });
    }

    get length(): number {
        return this.#requests.length;
    }
}