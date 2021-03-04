import BackgroundController from "./controller"

export default class ReauthController {
    static shared = new ReauthController()

    private constructor() {}

    public loggingIn = false

    #completions: Function[] = []

    public async relogin() {
        if (!BackgroundController.shared.popupWindow && !BackgroundController.shared.opening) throw new Error("Extension must be open.")
        if (this.loggingIn) await new Promise(resolve => this.#completions.push(resolve))
        else {
            this.loggingIn = true
            
            const tab: chrome.tabs.Tab = await new Promise(resolve => chrome.tabs.create({
                url: BackgroundController.shared.api.instanceOrigin,
                active: true
            }, resolve));

            chrome.windows.update(tab.windowId, {
                focused: true
            })

            chrome.tabs.onUpdated.addListener(async (tabID, changeInfo, changedTab) => {
                if (tabID !== tab.id) return
                if (changeInfo.url?.endsWith("/ultra/institution-page")) {
                    this.loggingIn = false
                    chrome.tabs.remove(tabID)
                    
                    BackgroundController.shared.reloadObservers.reject(new Error("Context invalidated."))

                    await BackgroundController.shared.reloadUserID()

                    BackgroundController.shared.openWindow()
                    
                    this.#completions.forEach(fn => fn())
                }
            })

            await new Promise(resolve => this.#completions.push(resolve))
        }
    }
}