import React from "react";
import { createPortal } from "react-dom";
import DataCellContextMenu from "./DataCellContextMenu";

/**
 * Mounts DataCellContextMenu shuttled to <element id="ctx" />
 * @returns 
 */
export default function CTXPortal() {
    return createPortal((
        <DataCellContextMenu />
    ), document.getElementById("ctx")!);
}