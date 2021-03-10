import { BBLog } from "@bbdash/shared";
import BackgroundController from "./controller";
import TabController from "./tab-controller";

const Log = BBLog("ReauthController");

export default class ReauthController {
    static shared = new ReauthController()

    private constructor() {}

    public loggingIn = false

    public needsReauthRequestListeners: Function[] = [];

    #completions: [Function, Function][] = []

    #authTabController = new TabController({
        dataForNewTab: () => ({
            url: BackgroundController.shared.api.instanceOrigin,
            active: true
        }),
        tabUpdated: async (tab) => {
            if (tab.url?.endsWith("/ultra/institution-page")) {
                await this.teardown();

                await BackgroundController.shared.reloadUserID()

                await BackgroundController.shared.windowController.open();
                
                this.#completions.forEach(([fn]) => fn())
            }
        }
    });

    private async teardown() {
        this.loggingIn = false
        await this.#authTabController.close();
        
        BackgroundController.shared.reloadObservers.reject(new Error("Context invalidated."))
    }

    public async userRequestedRelogin() {
        Log.debug("Reauth was requested.");

        this.loggingIn = true

        await this.#authTabController.open();

        await new Promise((resolve,reject) => this.#completions.push([resolve, reject]));
    }

    public async userDeniedRelogin() {
        Log.debug("Reauth was denied.");

        this.#completions.forEach(([, reject ]) => reject(new Error("User denied relogin.")));
        await this.teardown();
    }

    public async relogin() {
        if (!BackgroundController.shared.windowController.exists) {
            Log.debug("Reauth was requested without an existing window. Rejecting to prevent a feedback loop.");
            throw new Error("Extension must be open.")
        }
        if (this.loggingIn) {
            Log.debug("Reauth was requested while we are already reauthing. Resolving once reauth completes.");
            await new Promise((resolve, reject) => this.#completions.push([resolve, reject]));
        }
        else {        
            this.needsReauthRequestListeners.forEach(fn => fn());

            this.loggingIn = true

            await new Promise((resolve, reject) => this.#completions.push([resolve, reject]));
        }
    }

    public watchLogin(fn: Function) {
        if (this.loggingIn) fn();
        this.needsReauthRequestListeners.push(fn);
    }
}