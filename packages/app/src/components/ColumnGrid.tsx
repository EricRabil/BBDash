import React, { PropsWithRef, useCallback, useMemo } from "react";
import GridLayout, { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { AutoSizer } from "react-virtualized";
import { ColumnSettings, ColumnSettingsProvider, ColumnSettingsProviderProps } from "../contexts/column-settings-context";
import usePersistentColumns, { ColumnItem } from "../hooks/usePersistentColumns";
import { findColumnDefinitionByDataSource } from "../utils/column-definitions";

const HORIZONTAL_MARGIN = 5;
const VERTICAL_MARGIN = 0;
const COLUMNS = 12;
const COLUMN_WIDTH = 365;

const GRID_WIDTH = (COLUMNS * COLUMN_WIDTH) + (COLUMNS * HORIZONTAL_MARGIN);

/**
 * Facilitates passthrough of layout props to the inner item, while still setting up the provider
 */
const GridItemMounter = React.forwardRef(function GridItemMounter({ item, settings, setSettings, deleteColumn, ...props }: PropsWithRef<{ item: ColumnItem, tabIndex?: number } & Omit<ColumnSettingsProviderProps, "columnUID">>, ref) {
    const Element = findColumnDefinitionByDataSource(item.dataSource)?.component;

    if (!Element) return <div ref={ref as any} {...props} />;

    return (
        <ColumnSettingsProvider columnUID={item.uid} settings={settings} setSettings={setSettings} deleteColumn={deleteColumn}>
            <Element ref={ref} {...props} />
        </ColumnSettingsProvider>
    );
});

/**
 * Mounts the columns from usePersistentColumns in a rearrangable grid.
 * @param elProps the properties to pass to the root element
 */
export default function ColumnGrid(elProps: PropsWithRef<React.HTMLAttributes<HTMLElement>>) {
    const [ columnItems, setColumnItems, { removeColumn, updatePreferences } ] = usePersistentColumns();

    const layout: Layout[] = useMemo(() => columnItems.map((item, index) => ({ i: index.toString(), x: item.column, y: 0, w: 1, h: 1 })), [columnItems]);

    return (
        <div className="grid-track-root" role="main" {...elProps}>
            <AutoSizer>
                {({ height }) => (
                    <GridLayout className="column-track"
                        maxRows={1}
                        cols={COLUMNS}
                        margin={[HORIZONTAL_MARGIN, VERTICAL_MARGIN]}
                        width={GRID_WIDTH}
                        rowHeight={height}
                        compactType={"horizontal"}
                        autoSize={true}
                        draggableHandle=".column-drag-handle"
                        onLayoutChange={layout => {
                            setColumnItems(layout.map(item => Object.assign(columnItems[+item.i], {
                                column: item.x
                            })));
                        }}
                        layout={layout}
                        {...{
                            innerRef: (el: HTMLDivElement) => {
                                el?.setAttribute("role", "grid");
                            }
                        }}
                    >
                        {columnItems.map((item, index) => {
                            return (
                                <GridItemMounter tabIndex={layout[index].x + 1} key={index} item={item} settings={item.preferences} setSettings={settings => updatePreferences(index, settings)} deleteColumn={() => removeColumn(index)} />
                            );
                        })}
                    </GridLayout>
                )}
            </AutoSizer>
        </div>
    );
}
