import { Course } from "@bbdash/shared";
import React, { PropsWithoutRef, useContext } from "react";
import { CirclePicker, ColorResult } from "react-color";
import { ColorCodingContext } from "../../contexts/color-coding-context";

export default function CourseColorCoding({ course }: PropsWithoutRef<{ course: Course }>) {
    const { updateColorCodingForCourse, courses } = useContext(ColorCodingContext);

    const colorChanged = ({ rgb: { r, g, b }}: ColorResult) => {
        updateColorCodingForCourse(course.id, `rgba(${r},${g},${b},0.2)`);
    };

    return (
        <div className="course-color-picker">
            <div className="course-color-picker--course-name">{ course.name }</div>

            <CirclePicker color={courses[course.id] || undefined} circleSpacing={7} circleSize={21} width={"252px"} onChangeComplete={colorChanged}></CirclePicker>
        </div>
    );
}