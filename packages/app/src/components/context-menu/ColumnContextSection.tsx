import React from "react";
import { Item, Separator } from "react-contexify";
import { RightClickContext } from "../../contexts/right-click-context";
import ColumnColorCoding from "./items/ColumnColorCoding";
import ColumnCourseFilter from "./items/ColumnCourseFilter";
import ColumnDeleteTrigger from "./items/ColumnDeleteTrigger";

export default function ColumnContextSection() {
    return (
        <RightClickContext.Consumer>
            {({ uri }) => (
                uri?.isColumn ? (
                    <>
                        <Item onClick={e => e.event.stopPropagation()} className="no-hover-bg">
                            <ColumnColorCoding />
                        </Item>
                        <ColumnDeleteTrigger />
                        <ColumnCourseFilter />
                        <Separator />
                    </>
                ) : null
            )}
        </RightClickContext.Consumer>
    );
}