import { Course, StreamEntry } from "@bbdash/shared";
import transformCourseContents from "./contents";
import { DataSource, DataSourceMapping, TaggedCourseContentItem, TaggedGradebookEntries } from "./data-source-spec";
import transformGradeEntries from "./grades";
import { DataCellData } from "./spec";
import transformStreamEntries from "./stream";

export interface TransformationOptions {
    courses: Record<string, Course>;
    renderCache: Record<string, Node[]>;
}

export function transformData<DataSourceType extends DataSource>(dataSource: DataSourceType, data: DataSourceMapping[DataSourceType][], options: TransformationOptions): DataCellData[] {
    switch (dataSource) {
    case DataSource.stream:
        return transformStreamEntries(data as StreamEntry[], options);
    case DataSource.grades:
        return transformGradeEntries(data as TaggedGradebookEntries[], options);
    case DataSource.contents:
        return transformCourseContents(data as TaggedCourseContentItem[], options);
    default:
        return [];
    }
}