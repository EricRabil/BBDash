import { Course } from "@bbdash/shared";
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { selectCourses } from "../store/reducers/courses";

export interface CourseData {
    courses: Record<string, Course>;
    courseIDs: string[];
}

export default function CourseConsumer({ children }: { children: (data: CourseData) => React.ReactNode}) {
    const courses = useSelector(selectCourses);

    return (
        <>
            {children(useMemo(() => ({
                courses,
                courseIDs: Object.keys(courses)
            }), [courses]))}
        </>
    );
}