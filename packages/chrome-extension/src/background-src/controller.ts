import BlackboardAPI from "@bbdash/bb-api";
import WebStorageCookieStore from "tough-cookie-web-storage-store";

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

    private reloadObservers = new AsyncObserver<void>();
    public loginObservers = new AsyncObserver<void>();

    api = new BlackboardAPI({
        instanceURL: "https://learn.dcollege.net",
        store: new WebStorageCookieStore(localStorage),
        noStealth: true,
        noCookies: true,
        delegate: {
            xsrfInvalidated: () => {
                throw new Error("Method not implemented.")
            },
            relogin: async () => {
                throw new Error("Method not implemented.")
                if (this.loginObservers.isOpen) return await this.loginObservers.observe();

                this.loginObservers.open();

                try {
                    const tab: chrome.tabs.Tab = await new Promise(resolve => chrome.tabs.create({
                        url: this.api.instanceOrigin
                    }, resolve));
                    
                    await this.waitForSuccessfulReload();
    
                    await new Promise(resolve => chrome.tabs.discard(tab.id, resolve));
    
                    this.loginObservers.resolve();
                } catch (e) {
                    this.loginObservers.reject(e);
                    throw e;
                }
            },
            userID: () => {
                return persistent.userID;
            },
            userChanged: () => this.reloadUserID()
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
        if (this.reloadObservers.isOpen) return this.reloadObservers.observe();

        this.reloadObservers.open();

        try {
            persistent.userID = (await this.api.users.me()).id;
        } catch (e) {
            this.reloadObservers.reject(e);
            throw e;
        }

        this.reloadObservers.resolve();
    }

    openWindow() {
        if (this.popupWindow) chrome.windows.update(this.popupWindow.id, {
            focused: true
        })
        else chrome.windows.create({
            url: chrome.runtime.getURL("popup.html"),
            type: "popup"
        }, window => this.popupWindow = window!)
    }
}