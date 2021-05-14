import { BlackboardAPI } from "../api";

export interface BatchResponse<Result> {
    body: Result;
    headers: Record<string, string[]>;
    method: string;
    relativeUrl: string;
    statusCode: number;
}

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

    async batch<Result, T>(items: T[], generator: (item: T) => string, method: string = "GET"): Promise<BatchResponse<Result>[]> {
        if (!items.length) return [];

        const { data } = await this.axios.put<BatchResponse<Result>[]>("/utilities/batch?xb=1", items.map(item => ({
            method,
            relativeUrl: generator(item)
        })));
    
        return data;
    }
}