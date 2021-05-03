import React from "react";
import { Item } from "react-contexify";
import { ColumnSettingsContext } from "../../../contexts/column-settings-context";

export default function ColumnDeleteTrigger() {
    return (
        <ColumnSettingsContext.Consumer>
            {({ deleteColumn }) => (
                <Item onClick={deleteColumn} className="ctx-danger">Delete Column</Item>
            )}
        </ColumnSettingsContext.Consumer>
    );
}