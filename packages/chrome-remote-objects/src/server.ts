interface APIRequest<API extends object, Layer extends keyof API = keyof API, Method extends keyof API[Layer] = keyof API[Layer]> {
    layer: Layer;
    method: Method;
    id: string;
    args?: Method extends (...args: any[]) => any ? Parameters<Method> : never;
}

class DisconnectionObserver {
    #callback: () => void;
    #port: chrome.runtime.Port;
    #disconnected = false;

    public constructor(port: chrome.runtime.Port) {
        this.#port = port;
        port.onDisconnect.addListener(this.#callback = () => this.#disconnected = true);
    }

    public teardown() {
        this.#port.onDisconnect.removeListener(this.#callback);
    }

    public get disconnected() {
        return this.#disconnected;
    }
}

/**
 * Serves an API object over the chrome port system
 */
export class RemoteObjectServer<API extends object> {
    constructor(public api: API, public channel = "remote-objects") {
        
    }

    /**
     * Middleware when processing a request
     */
    public middleware: Array<(req: APIRequest<API>) => Promise<void>> = [];

    private boundHandleRuntimeConnect = this.handleRuntimeConnect.bind(this)
    private boundHandleRuntimeMessage = this.handleRuntimeMessage.bind(this)

    /**
     * Returns true if a value represents a proper API request
     * @param req value to inspect
     */
    private isAPIRequest(req: any): req is APIRequest<API> {
        return typeof req === "object"
            && "id" in req
            && typeof req.id === "string"
            && "layer" in req
            && typeof req.layer === "string"
            && req.layer in this.api
            && typeof this.api[req.layer as keyof API] === "object"
            && "method" in req
            && typeof req.method === "string"
            && typeof this.api[req.layer as keyof API][req.method as keyof object] === "function"
            && (typeof req.args === "object" ? Array.isArray(req.args) : true)
    }

    /**
     * Handles a remote-object connection
     * @param port port sending the request
     */
    async handleRuntimeConnect(port: chrome.runtime.Port) {
        switch (port.name) {
            case this.channel:
                port.onMessage.addListener(this.boundHandleRuntimeMessage)
        }
    }
    
    /**
     * Handles a request from the remote-object channel
     * @param request request
     * @param port originating port
     */
    async handleRuntimeMessage(request: any, port: chrome.runtime.Port) {
        // drop the request if it is invalid
        if (!this.isAPIRequest(request)) return;

        const disconnectionObserver = new DisconnectionObserver(port);

        const response = await this.handleRequest(request, port);

        if (disconnectionObserver.disconnected) return;
        disconnectionObserver.teardown();

        port.postMessage({
            response,
            id: request.id
        })
    }

    /**
     * Routes an API request and resolves with the result
     * @param request request to route and resolve
     */
    async handleRequest(request: APIRequest<API>, port: chrome.runtime.Port) {
        if (request.args) request.args = request.args.map(arg => {
            if (!arg || typeof arg !== "object" || !("__fn__" in arg)) return arg;
            let disconnected = false;
            port.onDisconnect.addListener(() => disconnected = true);
            return (...args: any[]) => {
                if (disconnected) return;
                try {
                    port.postMessage({
                        fnNonce: arg.__fn__,
                        fnResponse: args
                    })
                } finally {}
            }
        }) as (typeof request)['args'];

        for (const handler of this.middleware) {
            await handler(request);
        }

        return await (this.api[request.layer][request.method] as unknown as Function)(...(request.args || []));
    }

    listen() {
        this.listening = true;
    }

    stop() {
        this.listening = false;
    }

    get listening() {
        return chrome.runtime.onConnect.hasListener(this.boundHandleRuntimeConnect)
    }

    set listening(listening) {
        const mounted = this.listening

        if ((listening && mounted) || !(listening || mounted)) return;
        else if (listening && !mounted) chrome.runtime.onConnect.addListener(this.boundHandleRuntimeConnect)
        else if (!listening && mounted) chrome.runtime.onConnect.removeListener(this.boundHandleRuntimeConnect)
    }
}