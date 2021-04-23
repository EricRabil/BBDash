import { Course } from "@bbdash/shared";
import React, { PropsWithoutRef, useCallback, useContext } from "react";
import { ColorCodingContext } from "../../../contexts/color-coding-context";
import { ModifierKeyContext } from "../../../contexts/modifier-key-context";
import LabeledColorPicker from "./support/LabeledColorPicker";

/**
 * ContextMenu item for changing the color of a course
 */
export default function CourseColorCoding({ course }: PropsWithoutRef<{ course: Course }>) {
    const { courseColorPreferences, setCourseColorPreference } = useContext(ColorCodingContext);
    const { shift } = useContext(ModifierKeyContext);

    const setColorIndex = useCallback((index: number) => setCourseColorPreference(course.id, index), [course.id]);

    return (
        <LabeledColorPicker label={
            shift ? course.id : (course.displayName || course.name)
        } colorIndex={courseColorPreferences[course.id]} setColorIndex={setColorIndex} />
    );
}