import BlackboardAPI from "@bbdash/bb-api";
import { RemoteObjectFactory } from "@bbdash/chrome-remote-objects";
import { IntegrationAPI } from "@bbdash/shared";

const ChromeBlackboardAPI = RemoteObjectFactory.createFactory<BlackboardAPI>();

export const integrationAPI = RemoteObjectFactory.createFactory<IntegrationAPI>("integration");

integrationAPI.auth.onIsLoggedOut(() => console.log("pong"));

export default ChromeBlackboardAPI;