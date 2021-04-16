import React from "react";
import { createPortal } from "react-dom";
import DataCellContextMenu from "./DataCellContextMenu";

export default function CTXPortal() {
    return createPortal((
        <DataCellContextMenu />
    ), document.getElementById("ctx")!);
}