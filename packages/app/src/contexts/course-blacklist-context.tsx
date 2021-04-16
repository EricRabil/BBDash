import React, { createContext, PropsWithChildren, useCallback } from "react";
import { getPersistentValue } from "react-use-persistent";

export interface CourseBlacklistState {
    blacklistedCourses: string[];
    setBlacklisted: (courseID: string, blacklisted: boolean) => void;
    overwriteBlacklistedCourses: (newValue: string[]) => void;
    clear: () => void;
}

/**
 * Manages which courses should be dropped from column data
 */
export const CourseBlacklistContext = createContext<CourseBlacklistState>({
    blacklistedCourses: [],
    setBlacklisted: () => undefined,
    overwriteBlacklistedCourses: () => undefined,
    clear: () => undefined
});

const persistentBlacklistedCourses = getPersistentValue<string[]>("blacklisted-courses", []);

export function CourseBlacklistProvider({ children }: PropsWithChildren<{}>) {
    const [ blacklistedCourses, setBlacklistedCourses ] = persistentBlacklistedCourses.useAsState();
    
    const setBlacklisted = useCallback((courseID: string, blacklisted: boolean) => {
        if (blacklisted && !blacklistedCourses.includes(courseID)) setBlacklistedCourses(blacklistedCourses.concat(courseID));
        else if (!blacklisted && blacklistedCourses.includes(courseID)) setBlacklistedCourses(blacklistedCourses.filter(cmpCourseID => courseID !== cmpCourseID));
    }, [blacklistedCourses, setBlacklistedCourses]);

    const clear = useCallback(() => setBlacklistedCourses([]), [setBlacklistedCourses]);

    return (
        <CourseBlacklistContext.Provider value={{ blacklistedCourses, overwriteBlacklistedCourses: setBlacklistedCourses, setBlacklisted, clear }}>
            {children}
        </CourseBlacklistContext.Provider>
    );
}