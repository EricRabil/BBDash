import { BlackboardAPI } from "../api";

/**
 * Base layer for Blackboard API modules
 */
export default abstract class APILayer {
    /**
     * @param api the blackboard API instance to refer to
     */
    constructor(public api: BlackboardAPI) {}

    /**
     * Axios client to use for requests
     */
    protected get axios() {
        return this.api.axios;
    }
}