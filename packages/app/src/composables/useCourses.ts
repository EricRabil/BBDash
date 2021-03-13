import { Course } from "@bbdash/shared";
import { useContext } from "react";
import { useQuery } from "react-query";
import apiClient from "../api";
import { CourseFilterContext } from "../contexts/course-filter-context";

export function useUnfilteredCourses() {
    const { data: courses } = useQuery("courses", () => apiClient.courses.all(), {
        placeholderData: [] as Course[]
    });
    
    if (!courses) return {};
    else return courses.reduce((acc, course) => Object.assign(acc, { [course.id]: course }), {} as Record<string, Course>);
}

function courseIsActive({ term }: Course) {
    const now = new Date();
    return term && new Date(term.startDate) < now && new Date(term.endDate) > now;
}

export function useAllActiveCourses() {
    return Object.fromEntries(Object.entries(useUnfilteredCourses()).filter(([ _, course ]) => courseIsActive(course)));
}

/**
 * Links to an array of courses for the authenticated user
 */
export default function useCourses() {
    const courses = useUnfilteredCourses();

    const { courseFilter } = useContext(CourseFilterContext);

    return Object.fromEntries(Object.entries(courses).filter(([ courseID ]) => !courseFilter[courseID]));
}
