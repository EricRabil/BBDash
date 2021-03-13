import React, { useLayoutEffect, useState } from "react";

export interface CourseFilterContextImpl {
    courseFilter: Record<string, boolean>;
    setFiltered(course: string, filtered: boolean): void;
    enableFilter(course: string): void;
    disableFilter(course: string): void;
    clearFilter(): void;
    overwriteFilter(newFilter: Record<string, boolean>): void;
}

function deserializeWithDefault<T>(key: string, defaultValue: T): T {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return defaultValue;
        return JSON.parse(raw);
    } catch {
        return defaultValue;
    }
}

const baseCourseFilter = deserializeWithDefault("course-filter", {} as Record<string, boolean>);

export function useCourseFilter(): CourseFilterContextImpl {
    const [courseFilter, setCourseFilter] = useState(baseCourseFilter);

    useLayoutEffect(() => {
        localStorage.setItem("course-filter", JSON.stringify(courseFilter));
    }, [courseFilter]);

    function setFiltered(course: string, isFiltered: boolean) {
        setCourseFilter({
            ...courseFilter,
            [course]: isFiltered
        });
    }

    return {
        courseFilter,
        setFiltered,
        enableFilter: (course: string) => setFiltered(course, true),
        disableFilter: (course: string) => setFiltered(course, false),
        clearFilter: () => setCourseFilter({}),
        overwriteFilter: setCourseFilter
    };
}

export const CourseFilterContext = React.createContext({
    courseFilter: {},
    setFiltered: () => undefined,
    enableFilter: () => undefined,
    disableFilter: () => undefined,
    clearFilter: () => undefined,
    overwriteFilter: () => undefined
} as CourseFilterContextImpl);