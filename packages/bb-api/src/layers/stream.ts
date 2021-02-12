import { StreamEntry, StreamProvider, StreamQuery, StreamRefreshResult } from "@bbdash/shared";
import APILayer from "../structs/layer";

const STREAMS_ENDPOINT = "/streams/ultra";

/**
 * API layer for interacting with the Activity Stream
 */
export class StreamLayer extends APILayer {
    private providers: Record<string, StreamProvider> = {};
    private entries: Record<string, StreamEntry> = {};

    /**
     * Sends an update request to the stream endpoint and returns the response.
     */
    private async send(): Promise<StreamRefreshResult> {
        const { data } = await this.axios.post<StreamRefreshResult>(STREAMS_ENDPOINT, this.entriesResolver(), {
            headers: {
                ["Suppress-Session-Timestamp-Update"]: "true"
            }
        });

        data.sv_providers.forEach(provider => this.providers[provider.sp_provider] = provider);

        return data;
    }

    /**
     * Returns all stream entries we know about
     * @param cached whether to refer to the cache and not update. default false
     */
    async allEntries(cached = false): Promise<StreamEntry[]> {
        if (cached && Object.values(this.entries).length) return Object.values(this.entries);

        let result: StreamRefreshResult;

        do {
            // activity stream can have paged content or simply require multiple requests.
            // not sure why, there's only ever one result with the entries, the rest are just provider patches.
            // still, gonna follow spec
            result = await this.send();
            result.sv_streamEntries.forEach(entry => this.entries[entry.se_id] = entry);
        } while (result.sv_moreData);

        return Object.values(this.entries);
    }

    /**
     * Returns a resolver payload to be sent to the streams endpoint
     */
    private entriesResolver(): StreamQuery {
        return {
            flushCache: false,
            forOverview: false,
            providers: this.providers,
            retrieveOnly: true
        };
    }
}