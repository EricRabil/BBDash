import BlackboardAPI from "@bbdash/bb-api";
import WebStorageCookieStore from "tough-cookie-web-storage-store";
import ReauthController from "./reauth-controller";

const persistent: Record<string, string> = new Proxy(JSON.parse(localStorage.getItem('bb-controller-config') || '{}'), {
    set(target, prop, value) {
        (target as any)[prop] = value;

        localStorage.setItem('bb-controller-config', JSON.stringify(target));

        return true;
    }
})

let busy = false;

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
    popupWindow: chrome.windows.Window | null = null;

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
                await ReauthController.shared.relogin()
            },
            relogin: async () => {
                await ReauthController.shared.relogin()
            },
            userID: () => {
                return persistent.userID;
            },
            userChanged: async () => {
                console.log("she changed")
            }
        }
    })

    async reload() {
        await this.api.cookies.chrome.loadCookies();
        this.headers = await this.api.stealthHeaders();
    }

    private async waitForSuccessfulReload() {
        this.reloadObservers.open();
        
        await this.reloadObservers.observe().catch(() => this.waitForSuccessfulReload());
    }

    async reloadUserID() {
        if (this.reloadObservers.isOpen && !this.#droppedReload) return this.reloadObservers.observe();

        this.#droppedReload = false

        this.reloadObservers.open();

        try {
            console.log("MORE")
            persistent.userID = (await this.api.users.me()).id;
        } catch (e) {
            this.#droppedReload = true
            return this.reloadObservers.observe();
        }

        this.reloadObservers.resolve();
    }

    openWindow() {
        if (this.popupWindow) chrome.windows.update(this.popupWindow.id, {
            focused: true
        })
        else {
            this.opening = true
            chrome.windows.create({
                url: chrome.runtime.getURL("index.html"),
                type: "popup"
            }, window => this.popupWindow = window!)
        }
    }
}