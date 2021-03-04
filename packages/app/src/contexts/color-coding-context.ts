import React from "react";

export type ColorCodingValue = string | null | false;

export interface CourseColorLedger {
    [courseID: string]: ColorCodingValue;
}

export interface ColorCodingStorage {
    courses: CourseColorLedger;
    updateColorCodingForCourse(courseID: string, value: string | null | false): void;
}

const storageKey = "course-color-coding";

export function loadCourseColorLedger(): CourseColorLedger {
    try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return {};
        return JSON.parse(raw);
    } catch {
        return {};
    }
}

export function writeCourseColorLedger(ledger: CourseColorLedger) {
    localStorage.setItem(storageKey, JSON.stringify(ledger));
}

export const ColorCodingContext = React.createContext({} as ColorCodingStorage);