import { useContext } from "react";
import { useQuery } from "react-query";
import apiClient from "../api";
import { CourseFilterContext } from "../contexts/course-filter-context";

/**
 * Links to activity stream data for the authenticated user
 */
export default function useStream() {
    const { data } = useQuery("stream", () => apiClient.stream.allEntries());
    const { courseFilter } = useContext(CourseFilterContext);

    return (data || []).filter(e => !courseFilter[e.se_courseId]).sort((e1, e2) => e2.se_timestamp - e1.se_timestamp);
}