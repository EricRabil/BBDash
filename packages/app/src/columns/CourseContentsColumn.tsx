import { ContentCategories, ContentType, CourseContentItem } from "@bbdash/shared";
import React, { useMemo } from "react";
import { AutoSizer, CellMeasurer, CellMeasurerCache, List } from "react-virtualized";
import CourseContentCell from "../cells/CourseContentCell";
import Column, { BasePreferences, ColumnOptions } from "../components/Column";
import { ColumnSettingsListField } from "../components/ColumnSettingsField";
import useCourseContents from "../composables/useCourseContents";
import useCourses from "../composables/useCourses";
import { useDefaultPreferences } from "../composables/useDefaultPreferences";
import { SortOrder } from "../utils/feeds";
import { categoryNames } from "../utils/identifier-names";
import { activeKeys } from "../utils/prefs";

enum SortBy {
    created = "created",
    modified = "modified",
    title = "title"
}

export interface CourseContentsPreferences extends BasePreferences {
    includedCategories: Record<string, boolean>;
    includedCourseIDs: Record<string, boolean>;
    sortBy: SortBy;
    sortOrder: SortOrder;
}

function createLedger<T extends string | number | symbol>(keys: T[]): Record<T, boolean> {
    return keys.reduce((acc, c) => Object.assign(acc, { [c]: false }), {}) as Record<T, boolean>;
}

function hydratePreferenceLedger<T extends string | number | symbol>(keys: T[], preferenceLedger: Record<T, boolean>): Record<T, boolean> {
    return Object.assign({}, createLedger(keys), preferenceLedger);
}

const defaults: CourseContentsPreferences = {
    name: "Contents",
    includedCategories: {},
    includedCourseIDs: {},
    sortBy: SortBy.modified,
    sortOrder: SortOrder.ascending
};

const itemDate: (date: string | undefined) => Date = date => new Date(date || Date.now());

function sort<T extends CourseContentItem>(contents: T[], by: SortBy, order: SortOrder): T[] {
    switch (by) {
    case SortBy.created:
    case SortBy.modified:
        return contents.sort(({ [by]: date1 }, { [by]: date2 }) => {
            return +itemDate(order === SortOrder.ascending ? date2 : date1) - +itemDate(order === SortOrder.ascending ? date1 : date2);
        });
    case SortBy.title:
        return contents.sort(({ title: title1 }, { title: title2 }) => {
            return (order === SortOrder.ascending ? title2 : title1).localeCompare(order === SortOrder.ascending ? title1 : title2);
        });
    default:
        return contents;
    }
}

function hasKey<T extends object>(obj: T, key: string | number | symbol): key is keyof T {
    return key in obj;
}

function category(categoryID: string): ContentType[] {
    return hasKey(ContentCategories, categoryID) ? ContentCategories[categoryID] : [];
}

function filter<T extends CourseContentItem>(contents: T[], categories: string[]): T[] {
    return contents.filter(content => categories.some(categoryID => category(categoryID).includes(content.contentHandler?.id || ContentType.blank)));
}

/**
 * Presents contents for all courses in a streamlined column
 * @param props column options
 */
export default function CourseContentsColumn(props: ColumnOptions<CourseContentsPreferences>) {
    const courses = useCourses();
    const contents = useCourseContents();

    useDefaultPreferences(props, defaults);

    /**
     * Creates a memoized reference to a checklist-style preference object
     * @param keys all possible keys
     * @param ledger preference object
     * @param otherDeps any other dependencies to pass to the useMemo dependencies
     */
    const useMemoizedActiveKeys = <T extends string | number | symbol>(keys: T[], ledger: Record<T, boolean>, otherDeps: unknown[] = []) => useMemo(() => activeKeys(hydratePreferenceLedger(keys, ledger)), [ledger, ...otherDeps]);

    // all courseIDs to include
    const activeCourseIDs = useMemoizedActiveKeys(Object.keys(contents), props.preferences.includedCourseIDs, [contents]);
    // all categories to include
    const activeCategories = useMemoizedActiveKeys(Object.keys(ContentCategories), props.preferences.includedCategories);

    // sorted/filtered array of course contents
    const renderContents = useMemo(() => {
        const courseContents = activeCourseIDs.flatMap(courseID => (contents[courseID] || []).map(item => Object.assign({}, item, { courseID })));

        return sort(filter(courseContents, activeCategories), props.preferences.sortBy, props.preferences.sortOrder);
    }, [activeCourseIDs, activeCategories, contents, props.preferences.sortBy, props.preferences.sortOrder]);

    // all courseIDs that should be visible in the preferences
    const allCourseIDs = useMemo(() => Array.from(new Set([
        ...Object.keys(contents),
        ...activeCourseIDs
    ])), [contents, activeCourseIDs]);

    // render cache, updates when the contents change
    const cache = useMemo(() => new CellMeasurerCache({
        fixedWidth: true
    }), [renderContents]);

    return <Column header={<div>{props.preferences.name}</div>} settings={
        <React.Fragment>
            <ColumnSettingsListField type="list" multi={true} values={allCourseIDs} prefKey="includedCourseIDs" labelText={id => (
                <React.Fragment>
                    {courses[id]?.displayName || courses[id]?.name || id}
                </React.Fragment>
            )} header={<React.Fragment>Courses</React.Fragment>} {...props} />
            <ColumnSettingsListField type="list" multi={true} values={Object.keys(ContentCategories)} prefKey="includedCategories" labelText={id => (
                <React.Fragment>
                    {categoryNames[id as keyof typeof ContentCategories]}
                </React.Fragment>
            )} header={<React.Fragment>Content Categories</React.Fragment>} {...props} />
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
    }  attr-virtualized="true" {...props}>
        <AutoSizer>
            {({ height, width }) => (
                <List
                    deferredMeasurementCache={cache}
                    height={height}
                    width={width}
                    rowCount={renderContents.length}
                    rowHeight={cache.rowHeight}
                    rowRenderer={({ index, key, parent, style }) => (
                        <CellMeasurer
                            cache={cache}
                            columnIndex={0}
                            key={key}
                            rowIndex={index}
                            parent={parent}
                        >
                            {({ registerChild, measure }) => (
                                <CourseContentCell rootRef={registerChild} measure={measure} key={renderContents[index].id} course={courses[renderContents[index].courseID]} content={renderContents[index]} style={style} />
                            )}
                        </CellMeasurer>
                    )}
                ></List>
            )}
        </AutoSizer>
    </Column>;
}