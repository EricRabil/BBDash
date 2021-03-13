import { GradeMapping } from "@bbdash/shared";
import { useContext } from "react";
import { useQuery } from "react-query";
import apiClient from "../api";
import { CourseFilterContext } from "../contexts/course-filter-context";

/**
 * Links to the gradebook for the authenticated user
 */
export default function useGrades(): GradeMapping {
    const { data } = useQuery("grades", () => apiClient.grades.all());
    const { courseFilter } = useContext(CourseFilterContext);

    return Object.fromEntries(Object.entries(data || {}).filter(([ courseID ]) => !courseFilter[courseID]));
}