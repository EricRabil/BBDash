import { BBLog, DelegateTrait } from "@bbdash/shared";
import { ControlsObject } from "./controls-object";
import { addListener, mergeDisconnectHandles } from "./listener-lifecycles";

export type MaybePromise<T> = T | Promise<T>;

export interface WindowControllerDelegate {
    dataForNewWindow(): MaybePromise<chrome.windows.CreateData>;
    windowCreated?: (window: chrome.windows.Window) => MaybePromise<void>;
    windowClosed?: (id: number) => MaybePromise<void>;
    windowRevealed?: (window: chrome.windows.Window) => MaybePromise<void>;
    windowHidden?: (window: chrome.windows.Window) => MaybePromise<void>;
}

const Log = BBLog("WindowController::Static");

export function revealWindow(windowID: number): Promise<chrome.windows.Window> {
    Log.debug("Revealing window with ID", windowID);
    return new Promise(resolve => chrome.windows.update(windowID, {
        focused: true
    }, resolve))
}

export function createWindow(data: chrome.windows.CreateData): Promise<chrome.windows.Window> {
    Log.debug("Creating window with options", data);
    return new Promise((resolve, reject) => chrome.windows.create(data, window => window ? resolve(window) : reject(new Error("Failed to create window."))));
}

export function resolveWindow(windowID: number): Promise<chrome.windows.Window> {
    Log.debug("Resolving window with ID", windowID);
    return new Promise((resolve, reject) => chrome.windows.get(windowID, window => window ? resolve(window) : reject(new Error("Failed to create window."))));
}

export function closeWindow(windowID: number) {
    Log.debug("Closing window with ID", windowID);
    return new Promise(resolve => chrome.windows.remove(windowID, resolve));
}

/**
 * Manages the state of the allocated window, creating a new one when requested or revealing an existing and hidden window.
 */
export default class WindowController extends DelegateTrait<WindowControllerDelegate> implements ControlsObject<WindowControllerDelegate> {
    constructor(public delegate: WindowControllerDelegate) {
        super();

        this.disconnect = mergeDisconnectHandles([
            addListener(chrome.browserAction.onClicked, async () => {
                this.#log.debug("Browser action did fire.");
                await this.open();
            }),
    
            addListener(chrome.windows.onRemoved, async windowID => {
                if (windowID === this.#windowID) {
                    this.#windowID = null;
                    this.#log.debug("Window was closed with ID", windowID);
                    await this.maybeFire("windowClosed", windowID);
                }
            }),
    
            addListener(chrome.windows.onFocusChanged, async windowID => {
                if (windowID === this.#windowID) {
                    const window = await resolveWindow(windowID);
                    this.#log.debug("Received focus change. Focused:", window.focused);
                    await this.maybeFire(window.focused ? "windowRevealed" : "windowClosed", window);
                }
            })
        ]);
    }

    #windowID: number | null = null;

    #log = BBLog("WindowController");
    #opening = false;

    public readonly disconnect: () => Promise<void>;

    public async close() {
        this.#log.debug("Window requested to close.");
        if (this.#windowID === null) return this.#log.debug("No window is open. No-op for close request");
        await closeWindow(this.#windowID);
    }

    public async open() {
        this.#log.debug("Window was requested to open.");
        if (this.#windowID !== null) {
            const window = await revealWindow(this.#windowID);
            await this.maybeFire("windowRevealed", window);
        } else {
            this.#opening = true;
            const window = await createWindow(await this.delegate.dataForNewWindow());
            this.#windowID = window.id;
            this.#opening = false;
            await this.maybeFire("windowCreated", window);
        }
    }

    public get exists(): boolean {
        return this.#windowID !== null || this.#opening;
    }
}