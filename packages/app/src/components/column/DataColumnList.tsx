import React, { useCallback, useContext } from "react";
import { RowMeasurerPropsWithoutChildren, RowRenderingContext } from "react-window-dynamic-size-list";
import { CourseBlacklistContext } from "../../contexts/course-blacklist-context";
import { ItemOrganizerContext } from "../../contexts/item-organizer-context";
import { DataCellData } from "../../transformers/spec";
import AutoSizingDynamicSizeList from "../helpers/AutoSizingDynamicSizeList";
import DataColumnCell from "./DataColumnCell";

/**
 * Returns true if the JSON representations of the old and new props are equal
 */
function isRendererPropsForDataCellSame(oldProps: RowMeasurerPropsWithoutChildren<DataCellData, unknown>, newProps: RowMeasurerPropsWithoutChildren<DataCellData, unknown>) {
    const oldData = oldProps.data[oldProps.index], newData = newProps.data[newProps.index];
    return JSON.stringify(oldData) === JSON.stringify(newData);
}

function arraysAreEqual<T>(arr1: T[], arr2: T[]): boolean {
    if (arr1 === arr2) return true;
    return arr1.length === arr2.length && arr1.every((item, index) => arr2[index] === item);
}

export interface DataColumnListProps {
    data: DataCellData[];
    defaultSize: number;
}

/**
 * Handles the presentation of DataCellData, in a virtualized scrolling list
 */
export default React.memo(function DataColumnList({ data, defaultSize }: DataColumnListProps) {
    const getID = useCallback((index: number, data: DataCellData[]) => data[index]?.attributes.uri || "0", []);

    const { absoluteHiddenItems, absolutePinnedItems } = useContext(ItemOrganizerContext);
    const { absoluteBlacklistedCourses } = useContext(CourseBlacklistContext);

    const isHidden = useCallback((item: DataCellData) => {
        return absoluteHiddenItems.includes(item.attributes.uri) || absoluteBlacklistedCourses.includes(item.attributes.courseID);
    }, [absoluteHiddenItems, absoluteBlacklistedCourses]);

    return (
        <AutoSizingDynamicSizeList
            itemData={data}
            defaultSize={defaultSize || 0}
            getID={getID}
            isSame={isRendererPropsForDataCellSame}
            overscanCount={15}
        >
            {({ ref, index, data }: RowRenderingContext<DataCellData, unknown>) => (
                <DataColumnCell data={data[index]} isPinned={absolutePinnedItems.includes(data[index].attributes.uri)} isHidden={isHidden(data[index])} rootRef={ref} />
            )}
        </AutoSizingDynamicSizeList>
    );
}, (prevProps, nextProps) => {
    if (!arraysAreEqual(prevProps.data, nextProps.data)) return false;
    if (prevProps.defaultSize !== nextProps.defaultSize) return false;
    return true;
});