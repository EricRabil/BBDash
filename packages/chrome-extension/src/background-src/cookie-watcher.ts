import { BBLog } from "@bbdash/shared";
import BackgroundController from "./controller";
import { addListener, mergeDisconnectHandles } from "./listener-lifecycles";

const Log = BBLog("CookieWatcher");

export function setupCookieWatcher(controller: BackgroundController) {
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

    return mergeDisconnectHandles([
        addListener(chrome.webRequest.onHeadersReceived, details => {
            if (!(details.initiator && stripForInitiators.includes(details.initiator))) return {
                responseHeaders: details.responseHeaders
            }
            else return {
                responseHeaders: details.responseHeaders?.filter(h => !stripHeaders.includes(h.name.toLowerCase())) || []
            }
        }, {
            urls: allBlackboardURLs
        }, ["blocking", "responseHeaders"]),

        addListener(chrome.webRequest.onCompleted, async res => {
            await controller.api.cookies.chrome.loadCookies();

            Log.debug("Refreshing Blackboard cookies");
            
            controller.headers = await controller.api.stealthHeaders();
        }, {
            urls: allBlackboardURLs
        })
    ])
}
