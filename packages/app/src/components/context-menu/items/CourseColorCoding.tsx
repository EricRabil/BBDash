import { Course } from "@bbdash/shared";
import React, { PropsWithoutRef, useCallback, useContext } from "react";
import { CirclePicker, ColorResult } from "react-color";
import { ColorCodingContext } from "../../../contexts/color-coding-context";

/**
 * ContextMenu item for changing the color of a course
 */
export default function CourseColorCoding({ course }: PropsWithoutRef<{ course: Course }>) {
    const { courseColors, setCourseColorPreference, colors } = useContext(ColorCodingContext);

    const colorChanged = useCallback(({ hex }: ColorResult) => {
        setCourseColorPreference(course.id, colors.indexOf(hex));
    }, [setCourseColorPreference, colors, course]);

    return (
        <div className="course-color-picker">
            <div className="course-color-picker--course-name">{ course.displayName || course.name }</div>

            <CirclePicker colors={colors} color={courseColors[course.id]} circleSpacing={7} circleSize={21} width={"252px"} onChangeComplete={colorChanged}></CirclePicker>
        </div>
    );
}