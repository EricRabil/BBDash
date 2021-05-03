import React, { useCallback, useContext, useMemo } from "react";
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

const renderCaches: Record<number, Record<string, Node[]>> = {};
const getRenderCache = (id: number) => renderCaches[id] || (renderCaches[id] = {});

export default function DataPresentationConsumer<DataSourceType extends DataSource>({ children, dataSource }: { children: (data: DataCellData[]) => React.ReactNode, dataSource: DataSourceType }) {
    const rawData: DataSourceMapping[DataSourceType][] = useSelector(useMemo(() => selectDataForSource(dataSource), [ dataSource ]));

    const courses = useSelector(selectCourses);

    const { pinnedItems, hiddenItems } = useContext(ItemOrganizerContext);
    const { blacklistedCourses } = useContext(CourseBlacklistContext);

    const { settings: { filters, sortBy, sortOrder }, id } = useContext(ColumnSettingsContext);

    const rawTransformedData = useMemo(() => transformData(dataSource, rawData, {
        courses,
        renderCache: getRenderCache(id)
    }), [dataSource, rawData, courses]);

    const filteredData = useMemo(() => {
        let transformed = rawTransformedData;

        if (filters) {
            // apply user-configured filters
            transformed = filterData(transformed, {
                filters
            });
        }

        // apply global hiddenItems and blacklistedCourses filters
        return transformed.filter(data => !hiddenItems.includes(data.attributes.uri) && !blacklistedCourses.includes(data.attributes.courseID));
    }, [hiddenItems, blacklistedCourses, filters, rawTransformedData]);

    const doSort = useCallback((data: DataCellData[]) => {
        if (!sortBy) return data;

        return sortData(data, {
            sortOrder,
            sortBy
        });
    }, [sortBy, sortOrder]);

    // ready-to-render data
    const renderData = useMemo(() => {
        const [ pinnedData, normalData ] = splitArray(filteredData, item => pinnedItems.includes(item.attributes.uri) ? 0 : 1);

        doSort(pinnedData);
        doSort(normalData);

        return [ pinnedData, normalData ].flat();
    }, [pinnedItems, filteredData, doSort]);

    return (
        <>
            {children(renderData)}
        </>
    );
}