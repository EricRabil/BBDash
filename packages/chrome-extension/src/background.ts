import { RemoteObjectServer } from "@bbdash/chrome-remote-objects";
import BackgroundController from "./background-src/controller";
import { setupCookieWatcher } from "./background-src/cookie-watcher";
import { setupHeaderInjector } from "./background-src/header-injector";

const controller = BackgroundController.shared

controller.reload();

setupCookieWatcher(controller);
setupHeaderInjector(controller);

const server = new RemoteObjectServer(controller.api);
server.listen();

server.middleware.push(() => {
  if (controller.loginObservers.isOpen) {
    return controller.loginObservers.observe();
  } else if (!controller.userID) {
    return controller.reloadUserID();
  } else {
    return Promise.resolve();
  }
});

Object.assign(window, {controller})