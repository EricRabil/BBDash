import { GradeMapping } from "@bbdash/shared";
import { useContext, useMemo } from "react";
import { useSelector } from "react-redux";
import { CourseBlacklistContext } from "../contexts/course-blacklist-context";
import { selectGrades } from "../store/reducers/data";

/**
 * Links to the gradebook for the authenticated user
 */
export default function useGrades(): GradeMapping {
    const grades = useSelector(selectGrades);

    const { blacklistedCourses } = useContext(CourseBlacklistContext);

    const filteredGrades = useMemo(() => grades.filter(grade => !blacklistedCourses.includes(grade.courseID)), [blacklistedCourses, grades]);

    const mappedGrades = useMemo(() => filteredGrades.reduce((acc, { courseID, grades }) => Object.assign(acc, { [courseID]: grades }), {} as GradeMapping), [filteredGrades]);

    return mappedGrades;
}