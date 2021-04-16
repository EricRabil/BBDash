import { useMemo } from "react";
import { useSelector } from "react-redux";
import { selectCourses } from "../store/reducers/courses";
import { filterObject } from "../utils/object";

export function useAllActiveCourses() {
    const courses = useSelector(selectCourses);

    return useMemo(() => {
        const now = new Date();

        return filterObject(courses, (_, { term }) => {
            return term && new Date(term.startDate) < now && new Date(term.endDate) > now;
        });
    }, [courses]);
}
