import React, { PropsWithChildren } from "react";
import { usePersistent } from "react-use-persistent";

export interface CourseFilterContextImpl {
    courseFilter: Record<string, boolean>;
    setFiltered(course: string, filtered: boolean): void;
    enableFilter(course: string): void;
    disableFilter(course: string): void;
    clearFilter(): void;
    overwriteFilter(newFilter: Record<string, boolean>): void;
}

export const CourseFilterContext = React.createContext({
    courseFilter: {},
    setFiltered: () => undefined,
    enableFilter: () => undefined,
    disableFilter: () => undefined,
    clearFilter: () => undefined,
    overwriteFilter: () => undefined
} as CourseFilterContextImpl);

export function CourseFilterProvider({ children }: PropsWithChildren<{}>) {
    const [courseFilter, setCourseFilter] = usePersistent<Record<string, boolean>>("course-filter", {});

    function setFiltered(course: string, isFiltered: boolean) {
        setCourseFilter({
            ...courseFilter,
            [course]: isFiltered
        });
    }

    return (
        <CourseFilterContext.Provider value={{
            courseFilter,
            setFiltered,
            enableFilter: (course: string) => setFiltered(course, true),
            disableFilter: (course: string) => setFiltered(course, false),
            clearFilter: () => setCourseFilter({}),
            overwriteFilter: setCourseFilter
        }}>
            {children}
        </CourseFilterContext.Provider>
    );
}