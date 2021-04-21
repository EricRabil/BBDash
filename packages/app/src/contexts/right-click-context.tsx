import { Course } from "@bbdash/shared";
import React, { createContext, PropsWithChildren, useState } from "react";
import { useSelector } from "react-redux";
import { selectCourses } from "../store/reducers/courses";

export interface RightClickItem {
    itemURI: string;
    courseID: string;
}

export interface RightClickContextState {
    item: RightClickItem | null;
    currentCourse: Course | null;
    setItem: (item: RightClickItem | null) => void;
}

export const RightClickContext = createContext<RightClickContextState>({
    item: null,
    currentCourse: null,
    setItem: () => undefined
});

export function RightClickContextProvider({ children }: PropsWithChildren<{}>) {
    const [ item, setItem ] = useState<RightClickItem | null>(null);
    const courses = useSelector(selectCourses);

    const course = (item ? courses[item.courseID] : null) || null;

    return (
        <RightClickContext.Provider value={{ item, currentCourse: course, setItem }}>
            {children}
        </RightClickContext.Provider>
    );
}