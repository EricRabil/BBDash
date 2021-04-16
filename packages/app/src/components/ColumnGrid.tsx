import { IconProp } from "@fortawesome/fontawesome-svg-core";
import React, { PropsWithoutRef, PropsWithRef, useMemo } from "react";
import GridLayout, { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { AutoSizer } from "react-virtualized";
import { ColumnSettingsProvider } from "../contexts/column-settings-context";
import usePersistentColumns from "../hooks/usePersistentColumns";
import { DataSource } from "../transformers/data-source-spec";
import DataColumn, { DataColumnProps } from "./column/DataColumn";

const HORIZONTAL_MARGIN = 5;
const VERTICAL_MARGIN = 0;
const COLUMNS = 12;
const COLUMN_WIDTH = 345;

const GRID_WIDTH = (COLUMNS * COLUMN_WIDTH) + (COLUMNS * HORIZONTAL_MARGIN);

interface ColumnDefinition {
    icon: IconProp;
    component: React.FunctionComponentFactory<any>;
    id: string;
    name: string;
}

function makeDataSourceComponent<DataSourceType extends DataSource>(dataSource: DataSourceType, dataColumnProps: Partial<DataColumnProps<DataSourceType>> = {}) {
    return function DataSourceComponent(props: PropsWithoutRef<{}>) {
        return (
            <DataColumn {...dataColumnProps} dataSource={dataSource} {...props} />
        );
    };
}

export const COLUMN_DEFINITIONS: ColumnDefinition[] = [
    {
        icon: "align-left",
        component: makeDataSourceComponent(DataSource.stream),
        id: "stream",
        name: "Activity Stream"
    },
    {
        icon: "percent",
        component: makeDataSourceComponent(DataSource.grades),
        id: "grades",
        name: "Grades"
    },
    {
        icon: "database",
        component: makeDataSourceComponent(DataSource.contents, { defaultSize: 63 }),
        id: "contents",
        name: "Course Contents"
    }
];

/**
 * Finds the definition of a column with the given identifier
 * @param id identifier of the column to lookup
 */
export function findColumnDefinitionByID(id: string): ColumnDefinition | null {
    return COLUMN_DEFINITIONS.find(def => def.id === id) || null;
}

/**
 * Presents a track where columns can be placed and moved around
 * @param opts options to pass to the grid layout
 */
export default function ColumnGrid(elProps: PropsWithRef<React.HTMLAttributes<HTMLElement>>) {
    const [ columnItems, setColumnItems, { removeColumn, updatePreferences } ] = usePersistentColumns();

    const layout: Layout[] = useMemo(() => columnItems.map((item, index) => ({ i: index.toString(), x: item.column, y: 0, w: 1, h: 1 })), [columnItems]);

    console.log(layout);

    return (
        <div className="grid-track-root" {...elProps}>
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
                    >
                        {columnItems.map((item, index) => {
                            const Element = findColumnDefinitionByID(item.id)?.component;

                            if (!Element) return <div key={index} />;

                            return (
                                <ColumnSettingsProvider key={index} settings={item.preferences} setSettings={settings => updatePreferences(index, settings)} deleteColumn={() => removeColumn(index)}>
                                    <Element key={index} />
                                </ColumnSettingsProvider>
                            );
                        })}
                    </GridLayout>
                )}
            </AutoSizer>
        </div>
    );
}
