import BlackboardAPI from "@bbdash/bb-api";
import { RemoteObjectFactory } from "@bbdash/chrome-remote-objects";

const ChromeBlackboardAPI = RemoteObjectFactory.createFactory<BlackboardAPI>();

export default ChromeBlackboardAPI;