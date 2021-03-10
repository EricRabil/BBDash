export namespace RemoteObjectFactory {
    function makeid(length: number) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
     }

    export function createFactory<API extends object>(channel = "remote-objects"): API {
        const port = chrome.runtime.connect({ name: channel })

        const resolvers: Record<string, (...args: any[]) => any> = {};
        const proxiedFunctions: Map<string, (...args: any[]) => any> = new Map();

        port.onMessage.addListener(function(message) {
            if (typeof message !== "object") return;
            const { id, response, fnNonce, fnResponse } = message;
            if (fnNonce && proxiedFunctions.has(fnNonce)) proxiedFunctions.get(fnNonce)!(...fnResponse)
            if (!resolvers[id]) return;
            resolvers[id](response)
            delete resolvers[id]
        })

        return new Proxy({}, {
            get(target, layer: keyof object) {
                return target[layer] || (target[layer] = new Proxy({ layer }, {
                    get(target, method: keyof object) {
                        return target[method] || (target[method] = function(...args: any[]) {
                            const id = makeid(16)

                            args = args.map(arg => {
                                if (typeof arg === "function") {
                                    const nonce = makeid(16);
                                    proxiedFunctions.set(nonce, arg);
                                    return {
                                        __fn__: nonce
                                    }
                                }
                            })

                            return new Promise(resolve => {
                                port.postMessage({
                                    layer: target.layer,
                                    method,
                                    args,
                                    id
                                })

                                resolvers[id] = resolve;
                            })
                        } as never)
                    }
                }) as never)
            }
        }) as API
    }
}