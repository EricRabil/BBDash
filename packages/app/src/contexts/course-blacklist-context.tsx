import React, { createContext, PropsWithChildren, useCallback, useContext } from "react";
import { usePersistent } from "react-use-persistent";
import { FilterBehaviorContext } from "./filter-behavior-context";

export interface CourseBlacklistState {
    blacklistedCourses: string[];
    locallyBlacklistedCourses: string[];
    globallyBlacklistedCourses: string[];
    setBlacklisted: (courseID: string, blacklisted: boolean, globally?: boolean) => void;
    overwriteBlacklistedCourses: (newValue: string[]) => void;
    clear: (globally?: boolean) => void;
    isDefault: boolean;
}

/**
 * Manages which courses should be dropped from column data
 */
export const CourseBlacklistContext = createContext<CourseBlacklistState>({
    blacklistedCourses: [],
    locallyBlacklistedCourses: [],
    globallyBlacklistedCourses: [],
    setBlacklisted: () => undefined,
    overwriteBlacklistedCourses: () => undefined,
    clear: () => undefined,
    isDefault: true
});

export function PersistentCourseBlacklistProvider({ children }: PropsWithChildren<{}>) {
    const [ blacklistedCourses, setBlacklistedCourses ] = usePersistent<string[]>("blacklisted-courses", []);

    return (
        <CourseBlacklistProvider blacklistedCourses={blacklistedCourses} setBlacklistedCourses={setBlacklistedCourses}>
            {children}
        </CourseBlacklistProvider>
    );
}

export function CourseBlacklistProvider({ children, blacklistedCourses: locallyBlacklistedCourses, setBlacklistedCourses: setLocallyBlacklistedCourses }: PropsWithChildren<{ blacklistedCourses: string[], setBlacklistedCourses: (blacklistedCourses: string[]) => void }>) {
    const {
        blacklistedCourses: globallyBlacklistedCourses,
        setBlacklisted: setBlacklistedGlobally,
        clear: clearGlobally,
        isDefault: isRoot
    } = useContext(CourseBlacklistContext);
    const { uriFiltersAreDisabled } = useContext(FilterBehaviorContext);

    const setBlacklisted = useCallback((courseID: string, blacklisted: boolean, globally?: boolean) => {
        if (globally && !isRoot) setBlacklistedGlobally(courseID, blacklisted, globally);
        else if (blacklisted && !locallyBlacklistedCourses.includes(courseID)) setLocallyBlacklistedCourses(locallyBlacklistedCourses.concat(courseID));
        else if (!blacklisted && locallyBlacklistedCourses.includes(courseID)) setLocallyBlacklistedCourses(locallyBlacklistedCourses.filter(courseID1 => courseID !== courseID1));
    }, [isRoot, setBlacklistedGlobally, locallyBlacklistedCourses, setLocallyBlacklistedCourses]);

    const clear = useCallback((globally?: boolean) => {
        if (globally && !isRoot) clearGlobally(globally);
        else setLocallyBlacklistedCourses([]);
    }, [isRoot, clearGlobally, setLocallyBlacklistedCourses]);

    const overwriteBlacklistedCourses = useCallback((courseIDs: string[]) => {
        setLocallyBlacklistedCourses(courseIDs);
    }, [setLocallyBlacklistedCourses]);

    const blacklistedCourses = uriFiltersAreDisabled ? [] : globallyBlacklistedCourses.concat(locallyBlacklistedCourses);

    return (
        <CourseBlacklistContext.Provider value={{
            blacklistedCourses,
            locallyBlacklistedCourses,
            globallyBlacklistedCourses: isRoot ? locallyBlacklistedCourses : globallyBlacklistedCourses,
            overwriteBlacklistedCourses,
            setBlacklisted,
            clear,
            isDefault: false
        }}>
            {children}
        </CourseBlacklistContext.Provider>
    );
}