import { Course } from "@bbdash/shared";
import React, { PropsWithoutRef } from "react";
import { ColorCodingContext } from "../../../contexts/color-coding-context";
import { ModifierKeyContext } from "../../../contexts/modifier-key-context";
import LabeledColorPicker from "./support/LabeledColorPicker";

/**
 * ContextMenu item for changing the color of a course
 */
export default function CourseColorCoding({ course }: PropsWithoutRef<{ course: Course }>) {
    return (
        <ModifierKeyContext.Consumer>
            {({ shift }) => (
                <ColorCodingContext.Consumer>
                    {({ courseColorPreferences, setCourseColorPreference }) => (
                        <LabeledColorPicker label={
                            shift ? course.id : (course.displayName || course.name)
                        } colorIndex={courseColorPreferences[course.id]} setColorIndex={index => setCourseColorPreference(course.id, index)} />
                    )}
                </ColorCodingContext.Consumer>
            )}
        </ModifierKeyContext.Consumer>
    );
}