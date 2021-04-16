import { CourseContentItem, GradebookEntry, StreamEntry } from "@bbdash/shared";
import { DataCellSpec, ENTRY_CONTENT_CATEGORY, ENTRY_DUE_DATE, ENTRY_EMPTY, ENTRY_TIME, ENTRY_TITLE } from "./spec";

export enum DataSource {
    stream = "stream",
    contents = "contents",
    grades = "grades"
}

export type DataSourceSpecLedger = {
    [Key in DataSource]: DataCellSpec;
}

export const DataSourceSpecs: DataSourceSpecLedger = {
    [DataSource.stream]: {
        sortables: [ENTRY_TIME, ENTRY_TITLE, ENTRY_DUE_DATE]
    },
    [DataSource.contents]: {
        sortables: [ENTRY_TIME, ENTRY_TITLE],
        filterables: [ENTRY_CONTENT_CATEGORY]
    },
    [DataSource.grades]: {
        filterables: [ENTRY_EMPTY]
    }
};

export interface TaggedGradebookEntries {
    courseID: string;
    grades: GradebookEntry[];
}

export interface TaggedCourseContentItem extends CourseContentItem {
    courseID: string;
}

export type DataSourceMapping = {
    [DataSource.stream]: StreamEntry;
    [DataSource.contents]: TaggedCourseContentItem;
    [DataSource.grades]: TaggedGradebookEntries;
}