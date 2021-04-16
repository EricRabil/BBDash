import { Course } from "@bbdash/shared";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "..";

export type CoursesState = Record<string, Course>;

const initialState: CoursesState = {};

export const coursesSlice = createSlice({
    name: "courses",
    initialState,
    reducers: {
        coursesUpdated(state: CoursesState, { payload: courses }: PayloadAction<Course[]>) {
            for (const course of courses) {
                state[course.id] = course;
            }
        }
    }
});

export const { coursesUpdated } = coursesSlice.actions;

export const selectCourses = (state: RootState) => state.courses;
export const selectCourseArray = (state: RootState) => Object.values(state.courses);

export default coursesSlice.reducer;