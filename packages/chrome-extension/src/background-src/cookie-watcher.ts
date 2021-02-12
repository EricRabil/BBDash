import BackgroundController from "./controller";

export function setupCookieWatcher(controller: BackgroundController) {
    async function handler(res: chrome.webRequest.WebResponseCacheDetails) {
        await controller.api.cookies.chrome.loadCookies();
        
        controller.headers = await controller.api.stealthHeaders();
    }

    chrome.webRequest.onCompleted.addListener(handler, {
        urls: [new URL("*", controller.api.instanceOrigin).toString()]
    });

    return () => chrome.webRequest.onCompleted.removeListener(handler);
}