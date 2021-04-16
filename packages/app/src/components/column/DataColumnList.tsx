import React, { useCallback, useMemo } from "react";
import { areEqual } from "react-window";
import { RowMeasurerPropsWithoutChildren, RowRenderingContext } from "react-window-dynamic-size-list";
import { DataCellData } from "../../transformers/spec";
import AutoSizingDynamicSizeList from "../helpers/AutoSizingDynamicSizeList";
import DataColumnCell from "./DataColumnCell";

function isRendererPropsForDataCellSame(oldProps: RowMeasurerPropsWithoutChildren<DataCellData, unknown>, newProps: RowMeasurerPropsWithoutChildren<DataCellData, unknown>) {
    const oldData = oldProps.data[oldProps.index], newData = newProps.data[newProps.index];
    return JSON.stringify(oldData) === JSON.stringify(newData);
}

const DataColumnList = React.memo(function DataColumnList({ transformedData, defaultSize }: { transformedData: DataCellData[], defaultSize: number }) {
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
}, areEqual);

export default DataColumnList;