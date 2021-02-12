import React, { PropsWithChildren } from "react";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { AutoSizer } from "react-virtualized";
import { ColumnItem } from "../storage/column-items";

const HORIZONTAL_MARGIN = 5;
const VERTICAL_MARGIN = 0;
const COLUMNS = 12;
const COLUMN_WIDTH = 345;

const GRID_WIDTH = (COLUMNS * COLUMN_WIDTH) + (COLUMNS * HORIZONTAL_MARGIN);

export default function ColumnGrid({ onLayoutChange, children, columnItems }: PropsWithChildren<{ onLayoutChange(layout: GridLayout.Layout[]): void, columnItems: ColumnItem[] }>) {
    return <div className="grid-track-root">
        <AutoSizer>
            {({ height }) => (
                <GridLayout className="column-track"
                    maxRows={1}
                    cols={COLUMNS}
                    margin={[HORIZONTAL_MARGIN, VERTICAL_MARGIN]}
                    width={GRID_WIDTH}
                    rowHeight={height}
                    compactType={"horizontal"}
                    isResizable={false}
                    autoSize={true}
                    draggableHandle=".column-drag-handle"
                    onLayoutChange={onLayoutChange}
                >
                    {children}
                </GridLayout>
            )}
        </AutoSizer>
    </div>;
}
