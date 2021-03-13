import { CourseContentItem } from "@bbdash/shared";
import { useContext } from "react";
import { useQuery } from "react-query";
import apiClient from "../api";
import { CourseFilterContext } from "../contexts/course-filter-context";

/**
 * Links to the course contents of the authenticated user
 */
export default function useCourseContents() {
    const { data } = useQuery("course-contents", () => apiClient.courses.allContents(true, {
        cache: true
    }), {
        placeholderData: {} as Record<string, CourseContentItem[]>
    });
    const { courseFilter } = useContext(CourseFilterContext);

    return Object.fromEntries(Object.entries(data as Record<string, CourseContentItem[]>).filter(([ courseID ]) => !courseFilter[courseID]));
}