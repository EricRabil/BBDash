import { StreamEntry } from "@bbdash/shared";
import React, { useEffect, useMemo, useState } from "react";
import { AutoSizer, CellMeasurer, CellMeasurerCache, List } from "react-virtualized";
import "react-virtualized/styles.css";
import StreamEntryCell from "../cells/StreamEntryCell";
import Column, { BasePreferences, ColumnOptions } from "../components/Column";
import ColumnSettingsField from "../components/ColumnSettingsField";
import useCourses from "../composables/useCourses";
import { useDefaultPreferences, useMergePreferences } from "../composables/useDefaultPreferences";
import useStream from "../composables/useStream";

interface Filter {
    defaultName?: string;
    transform: (entries: StreamEntry[]) => StreamEntry[];
}

const filters: Record<string, Filter["transform"]> = {};

function registerFilter({ id, ...filter }: Filter & { id: string }) {
    filters[id] = filter.transform;
}

const contentHandlerCategories = {
    assignment: ["resource/x-bb-asmt-test-link", "resource/x-bb-assignment"]
};

registerFilter({
    id: "assignments",
    transform: (entries) => {
        return entries.filter(entry => contentHandlerCategories.assignment.includes(entry.itemSpecificData.contentDetails?.contentHandler));
    }
});

registerFilter({
    id: "announcements",
    transform: entries => entries.filter(entry => "ann_type" in entry.extraAttribs && entry.extraAttribs.ann_type !== null && !entry.itemSpecificData.notificationDetails?.dueDate)
});

interface Preferences extends BasePreferences {
    assignments: boolean;
    announcements: boolean;
    upcoming: boolean;
    sortUpcoming: boolean;
    name: string;
}

export interface StreamColumnOptions extends ColumnOptions<Preferences> {
    id?: string;
}

const defaults: Preferences = {
    assignments: false,
    announcements: false,
    upcoming: false,
    sortUpcoming: false,
    name: "Stream"
};

const entryDate = (entry: StreamEntry) => new Date(entry.itemSpecificData.notificationDetails?.dueDate || entry.se_timestamp);

export default function StreamColumn({
    id, ...props
}: StreamColumnOptions) {
    const courses = useCourses();
    const allEntries = useStream();
    const entries = useMemo(() => allEntries.filter(entry => courses[entry.se_courseId]), [
        allEntries
    ]);

    const [renderEntries, setRenderEntries] = useState([] as StreamEntry[]);

    const merge = useMergePreferences(props);
    useDefaultPreferences(props, defaults);

    const cache = new CellMeasurerCache({
        fixedWidth: true
    });

    useEffect(() => {
        let baseEntries = entries;

        if (props.preferences.assignments) baseEntries = filters.assignments(baseEntries);
        if (props.preferences.announcements) baseEntries = filters.announcements(baseEntries);

        const filteredEntries = baseEntries.filter((entry, index, entries) => {
            if (props.preferences.upcoming) {
                const after = entryDate(entry) > new Date();

                if (!after) return false;
            }

            if (entries.findIndex(entryCmp => entry.se_itemUri === entryCmp.se_itemUri) !== index) return false;
            
            return true;
        });

        if (props.preferences.sortUpcoming) {
            filteredEntries.sort((e1, e2) => +entryDate(e1) - +entryDate(e2));
        }

        setRenderEntries(filteredEntries);
    }, [props.preferences, entries]);

    return (
        <Column header={<div>{props.preferences.name}</div>} settings={(
            <React.Fragment>
                <ColumnSettingsField type="checkbox" labelText={(
                    <React.Fragment>Show assignments only</React.Fragment>
                )} prefKey="assignments" {...props} />
                <ColumnSettingsField type="checkbox" labelText={(
                    <React.Fragment>Show upcoming items only</React.Fragment>
                )} prefKey="upcoming" {...props} />
                <ColumnSettingsField type="checkbox" labelText={(
                    <React.Fragment>Sort by upcoming due date</React.Fragment>
                )} prefKey="sortUpcoming" {...props} />
                <ColumnSettingsField type="checkbox" labelText={(
                    <React.Fragment>Show announcements only</React.Fragment>
                )} prefKey="announcements" {...props} />
            </React.Fragment>
        )} {...props}>
            <AutoSizer>
                {({ height, width }) => (
                    <List
                        deferredMeasurementCache={cache}
                        height={height}
                        width={width}
                        rowCount={renderEntries.length}
                        rowHeight={cache.rowHeight}
                        rowRenderer={({ index, key, parent, style }) => (
                            <CellMeasurer
                                cache={cache}
                                columnIndex={0}
                                key={key}
                                rowIndex={index}
                                parent={parent}
                            >
                                <StreamEntryCell
                                    key={renderEntries[index].se_id}
                                    entry={renderEntries[index]}
                                    course={courses[renderEntries[index].se_courseId]}
                                    style={style}
                                />
                            </CellMeasurer>
                        )}
                    />
                )}
            </AutoSizer>
        </Column>
    );
}