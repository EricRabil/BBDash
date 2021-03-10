import { RemoteObjectServer } from "@bbdash/chrome-remote-objects";
import { IntegrationAPI } from "@bbdash/shared";
import BackgroundController from "./background-src/controller";
import { setupCookieWatcher } from "./background-src/cookie-watcher";
import { setupHeaderInjector } from "./background-src/header-injector";
import ReauthController from "./background-src/reauth-controller";

const controller = BackgroundController.shared

controller.reload();

setupCookieWatcher(controller);
setupHeaderInjector(controller);

const server = new RemoteObjectServer(controller.api);
server.listen();

const integrationImplementation: IntegrationAPI = {
  auth: {
    relogin: () => ReauthController.shared.relogin(),
    loggedOut: async () => controller.loginObservers.isOpen || !controller.userID,
    onIsLoggedOut: async fn => ReauthController.shared.watchLogin(fn),
    confirmRelogin: () => ReauthController.shared.userRequestedRelogin(),
    rejectRelogin: () => ReauthController.shared.userDeniedRelogin()
  }
}

const integration_server = new RemoteObjectServer(integrationImplementation, "integration");
integration_server.listen();

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