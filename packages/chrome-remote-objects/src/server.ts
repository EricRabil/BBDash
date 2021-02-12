interface APIRequest<API extends object, Layer extends keyof API = keyof API, Method extends keyof API[Layer] = keyof API[Layer]> {
    layer: Layer;
    method: Method;
    id: string;
    args?: Method extends (...args: any[]) => any ? Parameters<Method> : never;
}

export class RemoteObjectServer<API extends object> {
    constructor(public api: API) {
        
    }

    public middleware: Array<(req: APIRequest<API>) => Promise<void>> = [];

    private boundHandleRuntimeConnect = this.handleRuntimeConnect.bind(this)
    private boundHandleRuntimeMessage = this.handleRuntimeMessage.bind(this)

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

    async handleRuntimeConnect(port: chrome.runtime.Port) {
        switch (port.name) {
            case "remote-objects":
                port.onMessage.addListener(this.boundHandleRuntimeMessage)
        }
    }
    
    async handleRuntimeMessage(request: any, port: chrome.runtime.Port) {
        if (!this.isAPIRequest(request)) return;

        const response = await this.handleRequest(request);

        port.postMessage({
            response,
            id: request.id
        })
    }

    async handleRequest(request: APIRequest<API>) {
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