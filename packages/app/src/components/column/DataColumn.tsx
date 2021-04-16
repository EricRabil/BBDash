import classnames from "classnames";
import React, { PropsWithoutRef, useCallback, useContext, useMemo } from "react";
import { useSelector } from "react-redux";
import { ColumnSettingsContext } from "../../contexts/column-settings-context";
import { CourseBlacklistContext } from "../../contexts/course-blacklist-context";
import { ItemOrganizerContext } from "../../contexts/item-organizer-context";
import { selectCourses } from "../../store/reducers/courses";
import { selectDataForSource } from "../../store/reducers/data";
import { transformData } from "../../transformers";
import { DataSource, DataSourceMapping } from "../../transformers/data-source-spec";
import { DataCellData } from "../../transformers/spec";
import { splitArray } from "../../utils/array";
import { filterData, sortData } from "../../utils/data-presentation";
import DataColumnList from "./DataColumnList";
import DataColumnPreferences from "./DataColumnPreferences";

export interface DataColumnProps<DataSourceType extends DataSource> extends PropsWithoutRef<{
    className?: string;
}> {
    dataSource: DataSourceType;
    defaultSize?: number;
}

export default function DataColumn<DataSourceType extends DataSource>({ dataSource, defaultSize, className, ...props }: DataColumnProps<DataSourceType>) {
    const rawData: DataSourceMapping[DataSourceType][] = useSelector(useMemo(() => selectDataForSource(dataSource), [ dataSource ]));

    const courses = useSelector(selectCourses);

    const { pinnedItems, hiddenItems } = useContext(ItemOrganizerContext);
    const { blacklistedCourses } = useContext(CourseBlacklistContext);

    const { settings: { filters, sortBy, sortOrder, name } } = useContext(ColumnSettingsContext);

    const rawTransformedData = useMemo(() => transformData(dataSource, rawData, {
        courses
    }), [dataSource, rawData, courses]);

    const filteredData = useMemo(() => {
        let transformed = rawTransformedData;

        if (filters) {
            transformed = filterData(transformed, {
                filters
            });
        }

        return transformed.filter(data => {    
            return !hiddenItems.includes(data.attributes.uri) && !blacklistedCourses.includes(data.attributes.courseID);
        });
    }, [hiddenItems, blacklistedCourses, filters, rawTransformedData]);

    const doSort = useCallback((data: DataCellData[]) => {
        if (!sortBy) return data;

        return sortData(data, {
            sortOrder,
            sortBy
        });
    }, [sortBy, sortOrder]);

    const transformedData = useMemo(() => {
        const [ pinnedData, normalData ] = splitArray(filteredData, item => pinnedItems.includes(item.attributes.uri) ? 0 : 1);

        doSort(pinnedData);
        doSort(normalData);

        return [ pinnedData, normalData ].flat();
    }, [pinnedItems, filteredData, doSort]);

    return (
        <>
            <div className={classnames("column-container", className)} attr-virtualized="true" {...props}>
                <div className="column-drag-handle" />
                <div className="column-header">
                    <div className="column-header--main">
                        {name || "Column"}
                    </div>

                    <DataColumnPreferences dataSource={dataSource} />
                </div>
                <div className="column-body">
                    <DataColumnList transformedData={transformedData} defaultSize={defaultSize || 0} />
                </div>
            </div>
        </>
    );
}