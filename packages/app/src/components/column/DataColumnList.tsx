import React, { useCallback, useMemo } from "react";
import { RowMeasurerPropsWithoutChildren, RowRenderingContext } from "react-window-dynamic-size-list";
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

/**
 * Handles the presentation of DataCellData, in a virtualized scrolling list
 */
export default React.memo(function DataColumnList({ transformedData, defaultSize }: { transformedData: DataCellData[], defaultSize: number }) {
    const getID = useCallback((index: number, data: DataCellData[]) => data[index]?.attributes.uri || "0", []);

    return (
        <AutoSizingDynamicSizeList
            itemData={transformedData}
            defaultSize={defaultSize || 0}
            getID={getID}
            isSame={isRendererPropsForDataCellSame}
            overscanCount={15}
        >
            {useMemo(() => function SyntheticRowRenderer({ ref, index, data }: RowRenderingContext<DataCellData, unknown>) {
                return (
                    <DataColumnCell data={data[index]} rootRef={ref} />
                );
            }, [])}
        </AutoSizingDynamicSizeList>
    );
}, (prevProps, nextProps) => {
    if (!arraysAreEqual(prevProps.transformedData, nextProps.transformedData)) return false;
    if (prevProps.defaultSize !== nextProps.defaultSize) return false;
    return true;
});