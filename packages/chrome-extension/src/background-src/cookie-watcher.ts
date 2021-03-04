import BackgroundController from "./controller";

export function setupCookieWatcher(controller: BackgroundController) {
    async function handler(res: chrome.webRequest.WebResponseCacheDetails) {
        await controller.api.cookies.chrome.loadCookies();
        
        controller.headers = await controller.api.stealthHeaders();
    }

    const allBlackboardURLs = [new URL("*", controller.api.instanceOrigin).toString()];
    const me = new URL(chrome.runtime.getURL('')).origin;
    const stripHeaders = [
        "x-frame-options",
        "content-security-policy"
    ]

    const stripForInitiators = [
        controller.api.instanceOrigin,
        me
    ]

    // strips out csp and iframe restrictions for blackboard when the origin is either our extension or blackboard itself
    chrome.webRequest.onHeadersReceived.addListener(details => {
        if (!(details.initiator && stripForInitiators.includes(details.initiator))) return {
            responseHeaders: details.responseHeaders
        }
        else return {
            responseHeaders: details.responseHeaders?.filter(h => !stripHeaders.includes(h.name.toLowerCase())) || []
        }
    }, {
        urls: allBlackboardURLs
    }, ["blocking", "responseHeaders"]);

    chrome.webRequest.onCompleted.addListener(handler, {
        urls: allBlackboardURLs
    });

    return () => chrome.webRequest.onCompleted.removeListener(handler);
}
