import { ContentCategories, ContentType, StreamEntry } from "@bbdash/shared";
import React, { useMemo } from "react";
import { AutoSizer, CellMeasurer, CellMeasurerCache, List } from "react-virtualized";
import "react-virtualized/styles.css";
import StreamEntryCell from "../cells/StreamEntryCell";
import Column, { BasePreferences, ColumnOptions } from "../components/Column";
import { ColumnSettingsListField } from "../components/ColumnSettingsField";
import useCourses from "../composables/useCourses";
import { useDefaultPreferences } from "../composables/useDefaultPreferences";
import useStream from "../composables/useStream";
import { SortOrder } from "../utils/feeds";
import { categoryNames } from "../utils/identifier-names";
import { activeKeys } from "../utils/prefs";

enum SortBy {
    dueDate = "dueDate",
    timestamp = "timestamp",
    title = "title"
}

function always<T extends Function>(fn: T): T {
    return Object.assign(fn, {
        __always_apply__: true
    });
}

function alwaysApplies<T extends Function>(fn: T): boolean {
    return "__always_apply__" in fn;
}

const filters: Record<string, (entry: StreamEntry) => boolean> = {
    ...Object.entries(ContentCategories).reduce((acc, [ name, types ]) => Object.assign(acc, {
        [name]: (entry: StreamEntry) => types.includes(entry.itemSpecificData.contentDetails?.contentHandler as ContentType)
    }), {}),
    noContentHandler: entry => typeof entry.itemSpecificData?.contentDetails?.contentHandler === "undefined",
    announcement: entry => "ann_type" in entry.extraAttribs && entry.extraAttribs.ann_type !== null && !entry.itemSpecificData.notificationDetails?.dueDate,
    upcomingOnly: always(entry => entryDueDate(entry) > new Date())
};

const filterNames: Record<string, string> = {
    ...categoryNames,
    noContentHandler: "Unhandled",
    announcement: "Announcements",
    upcomingOnly: "Due Soon"
};

function determineDateFunction(sortBy: SortBy, order: SortOrder): (entry: StreamEntry) => Date {
    switch (sortBy) {
    case SortBy.dueDate:
        switch (order) {
        case SortOrder.descending:
            // This pins items without a due date to the end by inverting the default value for dueDate
            return entryDueDateInvertedDefault;
        case SortOrder.ascending:
        default:
            // This extracts the due date with the standard -Infinity default value
            return entryDueDate;
        }
    case SortBy.timestamp:
    default:
        // This extracts the se_timestamp
        return entryDate;
    }
}

function sort<T extends StreamEntry>(entries: T[], by: SortBy, order: SortOrder): T[] {
    const dateFn = determineDateFunction(by, order);

    switch (by) {
    case SortBy.dueDate:
    case SortBy.timestamp:
        return entries.sort((e1, e2) => {
            const e1Date = dateFn(e1);
            const e2Date = dateFn(e2);

            switch (order) {
            case SortOrder.ascending:
                return +e1Date - +e2Date;
            case SortOrder.descending:
                return +e2Date - +e1Date;
            }
        });
    case SortBy.title:
        return entries.sort((e1, e2) => ((order === SortOrder.descending ? e2 : e1).itemSpecificData.title || "").localeCompare((order === SortOrder.descending ? e1 : e2).itemSpecificData.title || ""));
    default:
        return entries;
    }
}

function filter<T extends StreamEntry>(entries: T[], filterIDs: string[]): T[] {
    const filterFunctions = filterIDs.map(id => filters[id]);
    const alwaysFilters = filterFunctions.filter(alwaysApplies);
    const optionalFilters = filterFunctions.filter(fn => !alwaysApplies(fn));

    return entries.filter((entry: T) => optionalFilters.some(filter => filter(entry)) && alwaysFilters.every(filter => filter(entry)));
}

interface Preferences extends BasePreferences {
    filters: Record<keyof typeof filters, boolean>;
    sortBy: SortBy;
    sortOrder: SortOrder;
    name: string;
}

export interface StreamColumnOptions extends ColumnOptions<Preferences> {
    id?: string;
}

const defaults: Preferences = {
    filters: Object.keys(filters).reduce((acc, filter) => Object.assign(acc, {
        [filter]: false
    }), {}),
    sortBy: SortBy.timestamp,
    sortOrder: SortOrder.descending,
    name: "Stream"
};

const entryDueDate = ({ itemSpecificData: { notificationDetails } }: StreamEntry, defaultMs = -Infinity) => new Date(notificationDetails?.dueDate || defaultMs);
const entryDueDateInvertedDefault = (entry: StreamEntry) => entryDueDate(entry, Infinity);
const entryDate = (entry: StreamEntry) => new Date(entry.se_timestamp);

/**
 * Renders all entries from the Blackboard activity stream
 * @param props column preferences and options
 */
export default function StreamColumn(props: StreamColumnOptions) {
    const courses = useCourses();
    const allEntries = useStream();
    const entries = useMemo(() => allEntries.filter(entry => courses[entry.se_courseId]), [
        allEntries
    ]);
    
    useDefaultPreferences(props, defaults);

    // memoized filters, updates when preferences changes
    const activeFilters = useMemo(() => activeKeys(Object.assign({}, defaults.filters, props.preferences.filters), ["upcomingOnly"]), [props.preferences.filters]);

    // memoized entries, deduping them by courseContentId (assignments are usually duplicated), updates when entries do
    const dedupedEntries = useMemo(() => entries.filter((entry, index, entries) => {
        if (entry.itemSpecificData.courseContentId) {
            return entries.findIndex(entryCmp => entry.itemSpecificData.courseContentId === entryCmp.itemSpecificData.courseContentId) === index;
        } else return true;
    }), [JSON.stringify(entries)]);

    // memoized render entries, updates when preferences or entries change
    const renderEntries = useMemo(() => {
        return sort(filter(dedupedEntries, activeFilters), props.preferences.sortBy, props.preferences.sortOrder);
    }, [props.preferences.filters, props.preferences.sortBy, props.preferences.sortOrder, dedupedEntries]);
    
    // memoized measurer cache, updates when the entries change
    const cache = useMemo(() => new CellMeasurerCache({
        fixedWidth: true,
        defaultHeight: 61
    }), [JSON.stringify(renderEntries)]);

    return (
        <Column header={<div>{props.preferences.name}</div>} settings={(
            <React.Fragment>
                <ColumnSettingsListField type="list" multi={true} values={Object.keys(filters)} labelText={id => <React.Fragment>{filterNames[id] || id}</React.Fragment>} prefKey="filters" header={<React.Fragment>Filters</React.Fragment>} {...props} />
                <ColumnSettingsListField type="list" multi={false} values={Object.values(SortBy)} prefKey="sortBy" labelText={sorter => (
                    <React.Fragment>
                        {sorter}
                    </React.Fragment>
                )} header={<React.Fragment>Sort By</React.Fragment>} {...props} />
                <ColumnSettingsListField type="list" multi={false} values={Object.values(SortOrder)} prefKey="sortOrder" labelText={sorter => (
                    <React.Fragment>
                        {sorter}
                    </React.Fragment>
                )} header={<React.Fragment>Sort Order</React.Fragment>} {...props} />
            </React.Fragment>
        )} attr-virtualized="true" {...props}>
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