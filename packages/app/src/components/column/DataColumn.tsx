import { ColumnSettingsContext, PreferenceConsumer } from "@contexts/column-settings-context";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DataSource } from "@transformers/data-source-spec";
import { BBURI } from "@utils/uri";
import classnames from "classnames";
import BBTooltip from "components/BBTooltip";
import React, { CSSProperties, PropsWithoutRef, useContext, useMemo } from "react";
import { useSelector } from "react-redux";
import { reloadOne } from "store/connection";
import { selectSyncStateForSource } from "store/reducers/data";
import CTXPortal from "../context-menu/CTXPortal";
import { useDataCellContextMenuHandler } from "../context-menu/DataCellContextMenu";
import DataColumnContextmenuController from "./DataColumnContextmenuController";
import DataColumnList from "./DataColumnList";
import DataColumnPreferences from "./DataColumnPreferences";
import DataColumnStyleInjector from "./DataColumnStyleInjector";
import DataPresentationConsumer from "./DataPresentationConsumer";

export interface DataColumnProps<DataSourceType extends DataSource> extends PropsWithoutRef<{
    className?: string;
    style?: CSSProperties;
}> {
    /**
     * Where the data originated. Used for determining things like filters, sort by in preferences
     */
    dataSource: DataSourceType;
    /**
     * Default size of the cell. Defaults to 0.
     * 
     * Increase this if your content will have intense renders so that less is rendered during initial measurements.
     */
    defaultSize?: number;
}

export default React.forwardRef(function DataColumn<DataSourceType extends DataSource>({ dataSource, defaultSize, className, style = {}, ...props }: DataColumnProps<DataSourceType>, ref: any) {
    const { id } = useContext(ColumnSettingsContext);

    const show = useDataCellContextMenuHandler(id.toString());

    const columnURI = useMemo(() => BBURI.forColumn(id).toString(), [id]);

    const syncing = useSelector(selectSyncStateForSource(dataSource));

    const headerLabelID = `${id}-label`;

    return (
        <>
            <DataColumnContextmenuController>
                <DataColumnStyleInjector>
                    <div ref={ref} onContextMenu={show} role="region" aria-labelledby={headerLabelID} className={classnames("column-container", className)} attr-virtualized="true" style={style} attr-uri={columnURI} {...props}>
                        <div className="column-drag-handle" />
                        <div className="column-header" role="heading">
                            <div id={headerLabelID} className="column-header--main">
                                <PreferenceConsumer preferenceKey="name">
                                    {([ name ]) => (
                                        name || "Column"
                                    )}
                                </PreferenceConsumer>
                            </div>

                            <BBTooltip content={<span>{syncing ? "Syncing" : "Sync"}</span>}>
                                <button onClick={() => {
                                    if (syncing) return;
                                    reloadOne(dataSource);
                                }} className="column-header-button">
                                    <FontAwesomeIcon icon="sync" spin={syncing} />
                                </button>
                            </BBTooltip>
                            
                            <DataColumnPreferences dataSource={dataSource} />
                        </div>
                        <div className="column-body" role="presentation">
                            <DataPresentationConsumer dataSource={dataSource}>
                                {renderData => (
                                    <DataColumnList data={renderData} defaultSize={defaultSize || 0} />
                                )}
                            </DataPresentationConsumer>
                        </div>
                    </div>
                </DataColumnStyleInjector>
            </DataColumnContextmenuController>

            <CTXPortal ctxID={id.toString()} />
        </>
    );
});