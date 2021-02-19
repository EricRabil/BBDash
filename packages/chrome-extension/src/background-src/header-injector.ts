import BackgroundController from "./controller";

const origin = new URL(chrome.runtime.getURL('')).origin

export function setupHeaderInjector(controller: BackgroundController) {
    function handler(req: chrome.webRequest.WebRequestHeadersDetails) {
        if (req.initiator !== origin) return;
      
        const headers = controller.headers;
      
        const localHeaders = Object.assign({}, headers);
      
        const newHeaders = [...(req.requestHeaders || [])]
      
        newHeaders.forEach(header => {
          if (localHeaders[header.name]) {
            header.value = localHeaders[header.name];
            delete localHeaders[header.name];
          }
        });
      
        Object.entries(localHeaders).forEach(([ name, value ]) => {
          newHeaders.push({
            name,
            value
          })
        });
      
        return {
          requestHeaders: newHeaders
        }
    }

    chrome.webRequest.onBeforeSendHeaders.addListener(handler, {
        urls: [new URL("*", controller.api.instanceOrigin).toString()]
    }, ['blocking', 'requestHeaders', 'extraHeaders'])

    // chrome.webRequest.onHeadersReceived.addListener(function(headers) {
    //   const existing = headers.responseHeaders?.find(h => h.name.toLowerCase() === 'content-security-policy')

    //   if (existing) existing.value = "script-src 'self' 'unsafe-inline'; object-src 'self'"
    //   else (headers.responseHeaders || (headers.responseHeaders = [])).push({
    //     name: "content-security-policy",
    //     value: "script-src 'self' 'unsafe-inline'; object-src 'self'"
    //   })

    //   return {
    //     responseHeaders: headers.responseHeaders
    //   }
    // }, {
    //   urls: [new URL("*", origin).toString()],
    //   types: ['main_frame', 'csp_report']
    // }, ['blocking', 'responseHeaders'])

    return () => chrome.webRequest.onBeforeSendHeaders.removeListener(handler);
}