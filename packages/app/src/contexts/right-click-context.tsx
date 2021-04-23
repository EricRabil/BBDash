import { Course } from "@bbdash/shared";
import React, { createContext, PropsWithChildren, useCallback, useLayoutEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectCourses } from "../store/reducers/courses";
import { BBURI } from "../utils/uri";

export interface RightClickContextState {
    uri: BBURI | null;
    currentCourse: Course | null;
    setRawURI: (rawURI: string | null) => void;
}

export const RightClickContext = createContext<RightClickContextState>({
    currentCourse: null,
    uri: null,
    setRawURI: () => undefined
});

export function RightClickContextProvider({ children }: PropsWithChildren<{}>) {
    const [ uri, setURI ] = useState<BBURI | null>(null);
    const [ courseID, setCourseID ] = useState<string | null>(null);
    const courses = useSelector(selectCourses);

    const currentCourse = (courseID ? courses[courseID] : null) || null;

    useLayoutEffect(() => setCourseID(uri?.courseID || null), [uri]);

    const setRawURI = useCallback((rawURI: string | null) => {
        if (uri?.toString() === rawURI) return;
        setURI(rawURI ? BBURI.fromRaw(rawURI) : null);
    }, [setURI]);

    return (
        <RightClickContext.Provider value={{ uri, currentCourse, setRawURI }}>
            {children}
        </RightClickContext.Provider>
    );
}