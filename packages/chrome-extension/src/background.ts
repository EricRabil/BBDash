import { RemoteObjectServer } from "@bbdash/chrome-remote-objects";
import BackgroundController from "./background-src/controller";
import { setupCookieWatcher } from "./background-src/cookie-watcher";
import { setupHeaderInjector } from "./background-src/header-injector";

const controller = new BackgroundController();

chrome.browserAction.onClicked.addListener(function(tab) {
  controller.openWindow();
});

controller.reload();

setupCookieWatcher(controller);
setupHeaderInjector(controller);

const server = new RemoteObjectServer(controller.api);
server.listen();

server.middleware.push(() => {
  if (controller.loginObservers.isOpen) {
    return controller.loginObservers.observe();
  } else {
    return Promise.resolve();
  }
});

Object.assign(window, {controller})