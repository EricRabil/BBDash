import { Course } from "@bbdash/shared";
import { useQuery } from "react-query";
import apiClient from "../api";

/**
 * Links to an array of courses for the authenticated user
 */
export default function useCourses() {
    const { data: courses } = useQuery("courses", () => apiClient.courses.all(), {
        placeholderData: [] as Course[]
    });

    if (!courses) return {};
    else return courses.reduce((acc, course) => Object.assign(acc, { [course.id]: course }), {} as Record<string, Course>);
}
