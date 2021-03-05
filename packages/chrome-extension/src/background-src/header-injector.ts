import { BBLog } from "@bbdash/shared";
import BackgroundController from "./controller";
import { addListener } from "./listener-lifecycles";

const origin = new URL(chrome.runtime.getURL('')).origin

const Log = BBLog("HeaderInjector");

export function setupHeaderInjector(controller: BackgroundController) {
    return addListener(chrome.webRequest.onBeforeSendHeaders, req => {
        if (req.initiator !== origin) return;
      
        Log.debug("Injecting Blackboard headers into request from self");

        const headers = controller.headers;
      
        const localHeaders = Object.assign({}, headers);
      
        const newHeaders = [...(req.requestHeaders || [])]
      
        newHeaders.forEach(header => {
          if (localHeaders[header.name]) {
            Log.debug("Matched header with name", header.name);
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
    }, {
      urls: [new URL("*", controller.api.instanceOrigin).toString()]
    }, ['blocking', 'requestHeaders', 'extraHeaders'])
}
