import React, { useContext } from "react";
import { ColumnSettingsContext } from "../../contexts/column-settings-context";
import { useDataCellContextMenuHandler } from "../context-menu/DataCellContextMenu";

export default function DataColumnContextmenuController({ children }: { children: JSX.Element }): JSX.Element {
    const { id } = useContext(ColumnSettingsContext);
    const show = useDataCellContextMenuHandler(id.toString());

    return (
        React.cloneElement(children, {
            onContextMenu: show
        })
    );
}