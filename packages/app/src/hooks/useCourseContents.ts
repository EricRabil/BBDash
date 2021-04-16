import { useContext, useMemo } from "react";
import { useSelector } from "react-redux";
import { CourseBlacklistContext } from "../contexts/course-blacklist-context";
import { selectCourseContents } from "../store/reducers/data";
import { TaggedCourseContentItem } from "../transformers/data-source-spec";

/**
 * Links to the course contents of the authenticated user
 */
export default function useCourseContents() {
    const courseContents = useSelector(selectCourseContents);

    const { blacklistedCourses } = useContext(CourseBlacklistContext);

    return useMemo(() => courseContents.reduce((acc, content) => {
        if (!blacklistedCourses.includes(content.courseID)) (acc[content.courseID] || (acc[content.courseID] = [])).push(content);
        return acc;
    }, {} as Record<string, TaggedCourseContentItem[]>), [courseContents, blacklistedCourses]);
}