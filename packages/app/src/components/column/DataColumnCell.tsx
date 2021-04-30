import React, { CSSProperties, MutableRefObject } from "react";
import { useSelector } from "react-redux";
import { selectCourses } from "../../store/reducers/courses";
import { DataCellData } from "../../transformers/spec";
import DataCellRenderContent from "./DataCellRenderContent";

export interface DataColumnCellProps {
    data: DataCellData;
    isPinned?: boolean;
    isHidden?: boolean;
    rootRef?: MutableRefObject<Element | null>;
}

/**
 * Renders one cell of data
 */
export default function DataColumnCell({ data, rootRef, isPinned = false, isHidden = false }: DataColumnCellProps) {
    const courses = useSelector(selectCourses);

    const course = courses[data.attributes.courseID];

    return (
        <div ref={el => rootRef && (rootRef.current = el)} style={{
            "--cellBackground": course ? `var(--course-background-${course.id})` : "",
            "--cellTextColor": course ? `var(--course-text-color-${course.id})` : ""
        } as unknown as CSSProperties} role="cell" className="column-cell data-cell" attr-pinned={isPinned.toString()} attr-hidden={isHidden.toString()} attr-uri={data.attributes.uri} attr-course-id={data.attributes.courseID}>
            <div className="data-cell--inner" role="presentation">
                <div className="data-cell--header" role="presentation">
                    <DataCellRenderContent content={data.header?.title} className="data-cell--header-title" role="heading" />
                    <DataCellRenderContent content={data.header?.sideTitle} className="data-cell--muted" />
                </div>
                <DataCellRenderContent content={data.subtitle} className="data-cell--muted" />
                <DataCellRenderContent content={data.description} className="data-cell--description" />
                <DataCellRenderContent content={data.footer} className="data-cell--muted data-cell--strong" />
            </div>
        </div>
    );
}