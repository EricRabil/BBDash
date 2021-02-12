import { CookieManager } from "../cookies";

/**
 * Base integration for the CookieManager
 */
export default abstract class CookieIntegration {
    /**
     * @param manager Blackboard Cookie manager
     */
    public constructor(public manager: CookieManager) {}

    /**
     * The ToughCookie jar
     */
    protected get jar() {
        return this.manager.jar;
    }

    /**
     * Blackboard API instance
     */
    protected get api() {
        return this.manager.api;
    }
}