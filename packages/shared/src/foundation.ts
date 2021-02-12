export interface AssetDescription {
    rawText: string;
    displayText: string;
    webLocation: string | null;
    fileLocation: string | null;
}

export interface PaginatedQuery<T> {
    paging: {
        nextPage: string;
        previousPage: string;
        limit: number;
        count: number;
        offset: number;
    }
    permissions: never;
    results: T[];
}