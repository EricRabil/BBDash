import { useContext, useMemo } from "react";
import { useSelector } from "react-redux";
import { CourseBlacklistContext } from "../contexts/course-blacklist-context";
import { selectStreamData } from "../store/reducers/data";

/**
 * Links to activity stream data for the authenticated user
 */
export default function useStream() {
    const { blacklistedCourses } = useContext(CourseBlacklistContext);
    const entries = useSelector(selectStreamData);

    return useMemo(() => entries.filter(entry => !blacklistedCourses.includes(entry.se_courseId)), [blacklistedCourses, entries]);
}