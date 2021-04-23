import React, { useContext } from "react";
import { Item, Separator } from "react-contexify";
import { ColumnSettingsContext } from "../../contexts/column-settings-context";
import { RightClickContext } from "../../contexts/right-click-context";
import ColumnColorCoding from "./items/ColumnColorCoding";

export default function ColumnContextSection() {
    const { uri: item } = useContext(RightClickContext);
    const { deleteColumn } = useContext(ColumnSettingsContext);

    if (!item?.isColumn) return null;

    return (
        <>
            <Item onClick={e => e.event.stopPropagation()} className="no-hover-bg">
                <ColumnColorCoding />
            </Item>
            <Item onClick={deleteColumn} className="ctx-danger">
                Delete Column
            </Item>
            <Separator />
        </>
    );
}