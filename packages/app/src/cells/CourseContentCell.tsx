import { Course, CourseContentItem } from "@bbdash/shared";
import { DateTime } from "luxon";
import React from "react";
import ColumnCell from "../components/ColumnCell";

/**
 * Displays one unit of course content
 */
export default class CourseContentCell extends React.Component<{
    course: Course;
    content: CourseContentItem;
    style?: React.CSSProperties;
}> {
    /**
     * Computed date label for this cell
     */
    date() {
        const timeString = this.props.content.modified || this.props.content.created;

        if (!timeString) return null;
        else return DateTime.fromISO(timeString).toLocaleString(DateTime.DATE_SHORT);
    }

    /**
     * Computed hyperlink for the title label
     */
    link() {
        const [ link ] = this.props.content.links || [];

        if (!link?.href) return null;
        else return new URL(link.href, new URL(this.props.course.externalAccessUrl).origin).toString();
    }

    render() {
        const date = this.date();
        const link = this.link();

        const HeaderTitle = link ? "a" : "div";

        return <ColumnCell className="data-cell" style={this.props.style}>
            <div className="data-cell--inner">
                <div className="data-cell--header">
                    <HeaderTitle href={link!} target="_blank" className="data-cell--header-title">{this.props.content.title}</HeaderTitle>
                    {
                        date ? <div className="data-cell--muted">{date}</div> : null
                    }
                </div>
                <div className="data-cell--muted">{this.props.course.displayName}</div>
                <div className="data-cell--description" dangerouslySetInnerHTML={{
                    __html: this.props.content.body
                }} />
            </div>
        </ColumnCell>;
    }
}