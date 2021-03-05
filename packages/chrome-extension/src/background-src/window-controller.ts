export type MaybePromise<T> = T | Promise<T>;

export interface WindowControllerDelegate {
    dataForNewWindow(): MaybePromise<chrome.windows.CreateData>;
    windowCreated?: (window: chrome.windows.Window) => MaybePromise<void>;
    windowClosed?: (id: number) => MaybePromise<void>;
    windowRevealed?: (window: chrome.windows.Window) => MaybePromise<void>;
    windowHidden?: (window: chrome.windows.Window) => MaybePromise<void>;
}

function reveal(windowID: number): Promise<chrome.windows.Window> {
    return new Promise(resolve => chrome.windows.update(windowID, {
        focused: true
    }, resolve))
}

function create(data: chrome.windows.CreateData): Promise<chrome.windows.Window> {
    return new Promise((resolve, reject) => chrome.windows.create(data, window => window ? resolve(window) : reject(new Error("Failed to create window."))));
}

function resolve(windowID: number): Promise<chrome.windows.Window> {
    return new Promise((resolve, reject) => chrome.windows.get(windowID, window => window ? resolve(window) : reject(new Error("Failed to create window."))));
}

function close(windowID: number) {
    return new Promise(resolve => chrome.windows.remove(windowID, resolve));
}

/**
 * Manages the state of the allocated window, creating a new one when requested or revealing an existing and hidden window.
 */
export default class WindowController {
    constructor(public delegate: WindowControllerDelegate) {
        chrome.browserAction.onClicked.addListener(() => this.openWindow());
        chrome.windows.onRemoved.addListener(async windowID => {
            if (windowID === this.windowID) {
                this.windowID = null;
                await this.maybeFire("windowClosed", windowID);
            }
        });
        chrome.windows.onFocusChanged.addListener(async windowID => {
            if (windowID === this.windowID) {
                const window = await resolve(windowID);
                await this.maybeFire(window.focused ? "windowRevealed" : "windowClosed", window);
            }
        });
    }

    public windowID: number | null = null;

    async closeWindow() {
        if (this.windowID === null) return;
        await close(this.windowID);
    }

    async openWindow() {
        if (this.windowID !== null) {
            const window = await reveal(this.windowID);
            await this.maybeFire("windowRevealed", window);
        } else {
            const window = await create(await this.delegate.dataForNewWindow());
            this.windowID = window.id;
            await this.maybeFire("windowCreated", window);
        }
    }

    private async maybeFire<K extends keyof WindowControllerDelegate>(key: K, arg0: Parameters<NonNullable<WindowControllerDelegate[K]>>[0]) {
        if (this.delegate[key]) await this.delegate[key]!(arg0! as any);
    }
}