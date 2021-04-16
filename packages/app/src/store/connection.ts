import { Course, CourseContentItem, GradeMapping, StreamEntry } from "@bbdash/shared";
import { batch } from "react-redux";
import { store } from ".";
import apiClient from "../api";
import { DataSource } from "../transformers/data-source-spec";
import { coursesUpdated } from "./reducers/courses";
import { dataUpdated } from "./reducers/data";

function dispatchGrades(grades: GradeMapping) {
    store.dispatch(dataUpdated({
        dataSource: DataSource.grades,
        data: Object.entries(grades).map(([ courseID, grades ]) => ({ courseID, grades }))
    }));
}

function dispatchStream(entries: StreamEntry[]) {
    store.dispatch(dataUpdated({
        dataSource: DataSource.stream,
        data: entries
    }));
}

function dispatchContents(contents: Record<string, CourseContentItem[]>) {
    store.dispatch(dataUpdated({
        dataSource: DataSource.contents,
        data: Object.entries(contents).map(([ courseID, courseContents ]) => courseContents.map(content => Object.assign(content, { courseID }))).reduce((acc, courseContents) => (acc.push(...courseContents), acc), [])
    }));
}

function dispatchCourses(courses: Course[]) {
    store.dispatch(coursesUpdated(courses));
}

export async function reloadGrades(cache = true) {
    const grades = await apiClient.grades.all(true, cache);

    dispatchGrades(grades);
}

export async function reloadStream(cache = true) {
    const entries = await apiClient.stream.allEntries(cache);

    dispatchStream(entries);
}

export async function reloadContents(cache = true) {
    const contents = await apiClient.courses.allContents(true, { cache });

    dispatchContents(contents);
}

export async function reloadCourses(cache = false) {
    const courses = await apiClient.courses.activeCourses(cache);

    dispatchCourses(courses);
}

const isResolved = async <T>(promise: Promise<T>): Promise<boolean> => {
    let resolved = false;

    await Promise.race([
        promise.then(() => resolved = true),
        new Promise(resolve => setTimeout(resolve, 500))
    ]);

    return resolved;
};

export async function reloadAll(cache = true) {
    const pendingContents = apiClient.courses.allContents(true, { cache });

    const [
        courses,
        grades,
        entries,
        contentsDidResolve
    ] = await Promise.all([
        apiClient.courses.activeCourses(cache),
        apiClient.grades.all(true, cache),
        apiClient.stream.allEntries(cache),
        isResolved(pendingContents)
    ]);

    const contents: Record<string, CourseContentItem[]> | null = contentsDidResolve ? await pendingContents : null;

    console.log({ courses, grades, entries, contents: pendingContents });

    batch(() => {
        dispatchCourses(courses);
        dispatchGrades(grades);
        dispatchStream(entries);
        if (contents) dispatchContents(contents);
    });

    if (!contents) {
        dispatchContents(await pendingContents);
    }
}