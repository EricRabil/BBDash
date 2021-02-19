import { useQuery } from "react-query";
import apiClient from "../api";

/**
 * Links to activity stream data for the authenticated user
 */
export default function useStream() {
    const { data } = useQuery("stream", () => apiClient.stream.allEntries());

    return (data || []).sort((e1, e2) => e2.se_timestamp - e1.se_timestamp);
}