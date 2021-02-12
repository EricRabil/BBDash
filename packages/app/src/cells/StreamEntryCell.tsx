import { Course, StreamEntry } from "@bbdash/shared";
import { DateTime } from "luxon";
import React from "react";
import ColumnCell from "../components/ColumnCell";

const renderBlacklist = [
    "resource/x-osv-kaltura/mashup",
    "resource/x-bb-externallink"
];

const courseLink = (course: Course, legacyURL?: string) => {
    const url = new URL(course.externalAccessUrl);

    if (legacyURL) url.searchParams.set("legacyUrl", legacyURL);

    return url.toString();
};

export default class StreamEntryCell extends React.Component<{
    course: Course;
    entry: StreamEntry;
    style?: React.CSSProperties | undefined;
    rootRef?: ((element: Element) => void) | undefined;
}> {
    title() {
        return this.props.entry.itemSpecificData.title || this.props.entry.itemSpecificData.notificationDetails?.announcementTitle;
    }

    description() {
        return this.props.entry.itemSpecificData.contentExtract;
    }

    dueDate() {
        const dueDate = this.props.entry.itemSpecificData.notificationDetails?.dueDate;

        if (dueDate) return DateTime.fromJSDate(new Date(dueDate)).toLocaleString(DateTime.DATETIME_FULL);
        else return null;
    }

    postedDate() {
        const timestamp = this.props.entry.se_timestamp;

        return DateTime.fromMillis(timestamp).toLocaleString(DateTime.DATE_SHORT);
    }

    link() {
        if (!this.props.entry.se_itemUri) return null;

        return courseLink(this.props.course, this.props.entry.se_itemUri);
    }

    render() {
        if (renderBlacklist.includes(this.props.entry.itemSpecificData?.contentDetails?.contentHandler)) return null;

        const title = this.title(), description = this.description(), dueDate = this.dueDate(), link = this.link();

        if (!title && !description) return null;

        const HeaderTitle = link ? "a" : "div";

        return (
            <ColumnCell rootRef={this.props.rootRef as any} className="data-cell" style={this.props.style}>
                <div className="data-cell--inner">
                    <div className="data-cell--header">
                        <HeaderTitle href={link!} target={link ? "_blank" : undefined} className="data-cell--header-title">{title}</HeaderTitle>
                        <div className="data-cell--muted">{this.postedDate()}</div>
                    </div>
                    <div className="data-cell--muted">{this.props.course.displayName}</div>
                    {
                        description ? <div className="data-cell--description" dangerouslySetInnerHTML={{
                            __html: description
                        }}></div> : null
                    }
                    {
                        dueDate ? <div className="data-cell--muted data-cell--strong">
                Due Date: {dueDate}
                        </div> : null
                    }
                </div>
            </ColumnCell>
        );
    }
}