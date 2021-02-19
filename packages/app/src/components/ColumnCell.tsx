import React, { ComponentPropsWithRef, Ref } from "react";

/**
 * Layout component for cells of data in a column
 * @param opts cell options
 */
export default function ColumnCell({ children, className, rootRef, ...props }: ComponentPropsWithRef<"div"> & {
    rootRef?: Ref<HTMLDivElement>
}) {
    return (
        <div className={`column-cell${className ? ` ${className}` : ""}`} ref={rootRef} {...props}>
            {children}
        </div>
    );
}