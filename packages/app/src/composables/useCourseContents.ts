import { CourseContentItem } from "@bbdash/shared";
import { useQuery } from "react-query";
import apiClient from "../api";

/**
 * Links to the course contents of the authenticated user
 */
export default function useCourseContents() {
    const { data } = useQuery("course-contents", () => apiClient.courses.allContents(true, {
        cache: true
    }), {
        placeholderData: {} as Record<string, CourseContentItem[]>
    });

    return data as Record<string, CourseContentItem[]>;
}