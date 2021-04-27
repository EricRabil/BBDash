import { StreamEntry } from "@bbdash/shared";
import { DateTime } from "luxon";
import { TransformationOptions } from ".";
import { courseLink } from "../utils/courses";
import { BBURI } from "../utils/uri";
import { DataCellData, ENTRY_DUE_DATE, ENTRY_TIME, ENTRY_TITLE, RenderContentFormat } from "./spec";
import { formatDate } from "./util";

const renderBlacklist = [
    "resource/x-osv-kaltura/mashup",
    "resource/x-bb-externallink"
];

export default function transformStreamEntries(entries: StreamEntry[], { courses }: TransformationOptions): DataCellData[] {
    const data: DataCellData[] = [];

    for (const entry of entries) {
        if (renderBlacklist.includes(entry.itemSpecificData.contentDetails?.contentHandler) || !courses[entry.se_courseId]) {
            continue;
        }

        const title = entry.itemSpecificData.title || entry.itemSpecificData.notificationDetails?.announcementTitle;
        const description = entry.itemSpecificData.contentExtract;
        const link = entry.se_itemUri ? courseLink(courses[entry.se_courseId], entry.se_itemUri) : null;
        const dueDate = formatDate(entry.itemSpecificData.notificationDetails?.dueDate);
        const postedDate = DateTime.fromMillis(entry.se_timestamp).toLocaleString(DateTime.DATE_SHORT);

        if (!title && !description) continue;

        data.push({
            header: {
                title: title ? {
                    format: RenderContentFormat.text,
                    data: title,
                    link
                } : null,
                sideTitle: postedDate
            },
            subtitle: courses[entry.se_courseId].displayName,
            description: description ? {
                format: RenderContentFormat.html,
                data: description
            } : null,
            footer: dueDate ? `Due Date: ${dueDate}` : null,
            attributes: {
                courseID: entry.se_courseId,
                uri: BBURI.fromStreamEntry(entry).toString()
            },
            sortables: {
                [ENTRY_TIME]: entry.se_timestamp,
                [ENTRY_TITLE]: title,
                [ENTRY_DUE_DATE]: entry.itemSpecificData.notificationDetails?.dueDate
            },
            filterables: {
                [ENTRY_DUE_DATE]: typeof entry.itemSpecificData.notificationDetails?.dueDate === "string"
            }
        });
    }

    return data;
}