import { Course } from "@bbdash/shared";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { unarchiveObject } from "@utils/persist";
import { getPersistentValue, VersionedValueWithStateAdapter } from "react-use-persistent";
import { RootState } from "..";

export type CoursesState = Record<string, Course>;

const COURSES_CACHE_KEY = "courses--cache";
const initialState: CoursesState = unarchiveObject(COURSES_CACHE_KEY);

export const coursesSlice = createSlice({
    name: "courses",
    initialState,
    reducers: {
        coursesUpdated(state: CoursesState, { payload: courses }: PayloadAction<Course[]>) {
            for (const course of courses) {
                state[course.id] = course;
            }

            localStorage.setItem(COURSES_CACHE_KEY, JSON.stringify(state));
        }
    }
});

export const { coursesUpdated } = coursesSlice.actions;

export const selectCourses = (state: RootState) => state.courses;
export const selectCourseArray = (state: RootState) => Object.values(state.courses);

export default coursesSlice.reducer;