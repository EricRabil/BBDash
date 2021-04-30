import { IconProp } from "@fortawesome/fontawesome-svg-core";
import React, { PropsWithoutRef } from "react";
import DataColumn, { DataColumnProps } from "../components/column/DataColumn";
import { DataSource } from "../transformers/data-source-spec";

export interface ColumnDefinition {
    icon: IconProp;
    component: React.ExoticComponent<any>;
    dataSource: DataSource;
    name: string;
}

export function makeDataSourceComponent<DataSourceType extends DataSource>(dataSource: DataSourceType, dataColumnProps: Partial<DataColumnProps<DataSourceType>> = {}) {
    return React.forwardRef(function DataSourceComponent(props: PropsWithoutRef<{}>, ref) {
        return (
            <DataColumn ref={ref as any} {...dataColumnProps} dataSource={dataSource} {...props} />
        );
    })!;
}

export const COLUMN_DEFINITIONS: ColumnDefinition[] = [
    {
        icon: "align-left",
        component: makeDataSourceComponent(DataSource.stream),
        dataSource: DataSource.stream,
        name: "Activity Stream"
    },
    {
        icon: "percent",
        component: makeDataSourceComponent(DataSource.grades),
        dataSource: DataSource.grades,
        name: "Grades"
    },
    {
        icon: "database",
        component: makeDataSourceComponent(DataSource.contents, { defaultSize: 63 }),
        dataSource: DataSource.contents,
        name: "Course Contents"
    }
];

/**
 * Finds the definition of a column with the given identifier
 * @param id identifier of the column to lookup
 */
export function findColumnDefinitionByDataSource(dataSource: DataSource): ColumnDefinition | null {
    return COLUMN_DEFINITIONS.find(def => def.dataSource === dataSource) || null;
}