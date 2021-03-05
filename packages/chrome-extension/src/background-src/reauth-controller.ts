import { BBLog } from "@bbdash/shared";
import BackgroundController from "./controller";
import TabController from "./tab-controller";

const Log = BBLog("ReauthController");

export default class ReauthController {
    static shared = new ReauthController()

    private constructor() {}

    public loggingIn = false

    #completions: Function[] = []

    #authTabController = new TabController({
        dataForNewTab: () => ({
            url: BackgroundController.shared.api.instanceOrigin,
            active: true
        }),
        tabUpdated: async (tab) => {
            if (tab.url?.endsWith("/ultra/institution-page")) {
                this.loggingIn = false
                await this.#authTabController.close();
                
                BackgroundController.shared.reloadObservers.reject(new Error("Context invalidated."))

                await BackgroundController.shared.reloadUserID()

                await BackgroundController.shared.windowController.open();
                
                this.#completions.forEach(fn => fn())
            }
        }
    });

    public async relogin() {
        if (!BackgroundController.shared.windowController.exists) {
            Log.debug("Reauth was requested without an existing window. Rejecting to prevent a feedback loop.");
            throw new Error("Extension must be open.")
        }
        if (this.loggingIn) {
            Log.debug("Reauth was requested while we are already reauthing. Resolving once reauth completes.");
            await new Promise(resolve => this.#completions.push(resolve));
        }
        else {
            Log.debug("Reauth was requested.");
            
            this.loggingIn = true
            
            await this.#authTabController.open();

            await new Promise(resolve => this.#completions.push(resolve))
        }
    }
}