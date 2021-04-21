import React, { CSSProperties, MutableRefObject } from "react";
import { useSelector } from "react-redux";
import { selectCourses } from "../../store/reducers/courses";
import { DataCellData } from "../../transformers/spec";
import DataCellRenderContent from "./DataCellRenderContent";

/**
 * Renders one cell of data
 */
export default function DataColumnCell({ data, rootRef }: { data: DataCellData, rootRef?: MutableRefObject<Element | null> }) {
    const courses = useSelector(selectCourses);

    const course = courses[data.attributes.courseID];

    return (
        <div ref={el => rootRef && (rootRef.current = el)} style={{
            "--cellBackground": course ? `var(--course-background-${course.id})` : "",
            "--cellTextColor": course ? `var(--course-text-color-${course.id})` : ""
        } as unknown as CSSProperties} className="column-cell data-cell" attr-uri={data.attributes.uri} attr-course-id={data.attributes.courseID}>
            <div className="data-cell--inner">
                <div className="data-cell--header">
                    <DataCellRenderContent content={data.header?.title} className="data-cell--header-title" />
                    <DataCellRenderContent content={data.header?.sideTitle} className="data-cell--muted" />
                </div>
                <DataCellRenderContent content={data.subtitle} className="data-cell--muted" />
                <DataCellRenderContent content={data.description} className="data-cell--description" />
                <DataCellRenderContent content={data.footer} className="data-cell--muted data-cell--strong" />
            </div>
        </div>
    );
}