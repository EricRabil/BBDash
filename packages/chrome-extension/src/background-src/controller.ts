import BlackboardAPI from "@bbdash/bb-api";
import { BBLog } from "@bbdash/shared";
import WebStorageCookieStore from "tough-cookie-web-storage-store";
import ReauthController from "./reauth-controller";
import WindowController from "./window-controller";

const persistent: Record<string, string> = new Proxy(JSON.parse(localStorage.getItem('bb-controller-config') || '{}'), {
    set(target, prop, value) {
        (target as any)[prop] = value;

        localStorage.setItem('bb-controller-config', JSON.stringify(target));

        return true;
    }
})

const Log = BBLog("BackgroundController");

class AsyncObserver<T> {
    private pool: Array<[(res: T) => void, (err: any) => void]> | null = null;

    observe(): Promise<T> {
        return new Promise((resolve, reject) => this.pool?.push([resolve, reject]) || reject(new Error("Not open.")));
    }

    open() {
        if (this.pool) return;
        this.pool = [];
    }

    resolve(result: T) {
        this.pool?.forEach(([ resolve ]) => resolve(result));
        this.pool = null;
    }

    reject(err: any) {
        this.pool?.forEach(([ , reject ]) => reject(err));
        this.pool = null;
    }

    get isOpen() {
        return this.pool !== null;
    }
}

export default class BackgroundController {
    userID: string | null = null;

    headers: Record<string, string> = {};

    public reloadObservers = new AsyncObserver<void>();
    public loginObservers = new AsyncObserver<void>();

    opening = false;

    #droppedReload = false

    static shared = new BackgroundController()

    private constructor() {}

    api = new BlackboardAPI({
        instanceURL: "https://learn.dcollege.net",
        store: new WebStorageCookieStore(localStorage),
        noStealth: true,
        noCookies: true,
        delegate: {
            xsrfInvalidated: async () => {
                Log.info("XSRF was invalidated.");
                await ReauthController.shared.relogin()
            },
            relogin: async () => {
                Log.info("BBAPI did request a relogin.");
                await ReauthController.shared.relogin()
            },
            userID: () => {
                return persistent.userID;
            },
            userChanged: async () => {
                Log.debug("BBAPI did inform of a user change.");
            }
        }
    })

    windowController = new WindowController({
        dataForNewWindow: () => ({
            url: chrome.runtime.getURL("index.html"),
            type: "popup"
        })
    })

    async reload() {
        Log.info("Reloading BB cookies/headers");
        await this.api.cookies.chrome.loadCookies();
        this.headers = await this.api.stealthHeaders();
    }

    private async waitForSuccessfulReload() {
        this.reloadObservers.open();
        
        await this.reloadObservers.observe().catch(() => this.waitForSuccessfulReload());
    }

    async reloadUserID() {
        if (this.reloadObservers.isOpen && !this.#droppedReload) {
            Log.debug("UserID reload requested but we are already reloading. Resolving when complete");
            return this.reloadObservers.observe();
        }

        Log.debug("Reloading UserID");

        this.#droppedReload = false

        this.reloadObservers.open();

        try {
            persistent.userID = (await this.api.users.me()).id;
            Log.debug("UserID was reloaded. New ID:", persistent.userID);
        } catch (e) {
            Log.error("UserID failed to reload with error");
            console.error(e);
            this.#droppedReload = true
            return this.reloadObservers.observe();
        }

        this.reloadObservers.resolve();
    }
}