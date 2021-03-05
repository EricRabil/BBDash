type ExtractListenerParameters<T> = T extends chrome.events.Event<any> ? Parameters<T["addListener"]> : never[];

/**
 * Adds a listener with the given parameters to the chrome event system, returning a disconnect handle
 * @param listener event listener
 * @param args parameters for the listener
 */
export function addListener<T extends chrome.events.Event<any>>(listener: T, ...args: ExtractListenerParameters<T>) {
    (listener.addListener as any)(...args);
    return () => listener.removeListener(args[0]);
}

/**
 * Merges multiple disconnect handles into a single, promise-returning function
 * @param handles handles to merge
 */
export function mergeDisconnectHandles(handles: (() => void)[]): () => Promise<void> {
    return async () => {
        await Promise.all(handles.map(handle => handle()));
    };
}

/**
 * Represents an entity that can be disconnected from chrome extension events.
 */
export interface Disconnectable {
    readonly disconnect: () => Promise<void>;
}