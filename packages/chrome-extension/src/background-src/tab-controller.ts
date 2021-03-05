import { BBLog, DelegateTrait } from "@bbdash/shared";
import { ControlsObject } from "./controls-object";
import { addListener, mergeDisconnectHandles } from "./listener-lifecycles";
import { revealWindow } from "./window-controller";

export type MaybePromise<T> = T | Promise<T>;

export interface TabControllerDelegate {
    dataForNewTab(): MaybePromise<chrome.tabs.CreateProperties>;
    tabCreated?: (tab: chrome.tabs.Tab) => MaybePromise<void>;
    tabClosed?: (id: number) => MaybePromise<void>;
    tabRevealed?: (tab: chrome.tabs.Tab) => MaybePromise<void>;
    tabHidden?: (tab: chrome.tabs.Tab) => MaybePromise<void>;
    tabUpdated?: (tab: chrome.tabs.Tab) => MaybePromise<void>;
}

const Log = BBLog("TabController::Static");

async function reveal(tabID: number): Promise<chrome.tabs.Tab> {
    Log.debug("Revealing tab with ID", tabID);

    const { windowId } = await resolve(tabID);
    
    const [ , tab ] = await Promise.all([
        revealWindow(windowId),
        new Promise((resolve, reject) => chrome.tabs.update(tabID, {
            active: true
        }, tab => tab ? resolve(tab) : reject(new Error("Failed to reveal tab."))))
    ] as [ Promise<chrome.windows.Window>, Promise<chrome.tabs.Tab> ]);

    return tab;
}

async function create(data: chrome.tabs.CreateProperties): Promise<chrome.tabs.Tab> {
    Log.debug("Creating tab with options", data);
    const tab: chrome.tabs.Tab = await new Promise((resolve, reject) => chrome.tabs.create(data, tab => tab ? resolve(tab) : reject(new Error("Failed to create tab."))));
    await revealWindow(tab.windowId)
    
    return tab
}

function resolve(tabID: number): Promise<chrome.tabs.Tab> {
    Log.debug("Resolving tab with ID", tabID);
    return new Promise((resolve, reject) => chrome.tabs.get(tabID, tab => tab ? resolve(tab) : reject(new Error("Failed to create tab."))));
}

function close(tabID: number) {
    Log.debug("Closing tab with ID", tabID);
    return new Promise(resolve => chrome.tabs.remove(tabID, resolve));
}

/**
 * Manages the state of the allocated tab, creating a new one when requested or revealing an existing and hidden tab.
 */
export default class TabController extends DelegateTrait<TabControllerDelegate> implements ControlsObject<TabControllerDelegate> {
    constructor(public delegate: TabControllerDelegate) {
        super();
        
        this.disconnect = mergeDisconnectHandles([
            addListener(chrome.tabs.onRemoved, async tabID => {
                if (tabID === this.#tabID) {
                    this.#tabID = null;
                    this.#log.debug("Tab was closed with ID", tabID);
                    await this.maybeFire("tabClosed", tabID);
                }
            }),
    
            addListener(chrome.tabs.onActivated, async ({ tabId: tabID }) => {
                if (tabID === this.#tabID) {
                    const tab = await resolve(tabID);
                    this.#log.debug("Received focus change. Focused:", tab.active);
                    await this.maybeFire(tab.active ? "tabRevealed" : "tabClosed", tab);
                }
            }),

            addListener(chrome.tabs.onUpdated, async (tabID, _, changedTab) => {
                if (tabID === this.#tabID) {
                    this.#log.debug("Received tab change.");
                    await this.maybeFire("tabUpdated", changedTab);
                }
            })
        ]);
    }

    #tabID: number | null = null;

    #log = BBLog("TabController");
    #opening = false;
    
    public readonly disconnect: () => Promise<void>;

    public async close() {
        this.#log.debug("Tab requested to close.");
        if (this.#tabID === null) return this.#log.debug("No tab is open. No-op for close request");
        await close(this.#tabID);
    }

    public async open() {
        this.#log.debug("Tab was requested to open.");
        if (this.#tabID !== null) {
            const tab = await reveal(this.#tabID);
            await this.maybeFire("tabRevealed", tab);
        } else {
            this.#opening = true;
            const tab = await create(await this.delegate.dataForNewTab());
            this.#tabID = tab.id === undefined ? null : tab.id;
            this.#opening = false;
            await this.maybeFire("tabCreated", tab);
        }
    }

    public get exists(): boolean {
        return this.#tabID !== null || this.#opening;
    }
}