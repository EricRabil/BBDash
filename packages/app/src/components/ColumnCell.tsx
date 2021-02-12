import React, { ComponentPropsWithRef, Ref } from "react";

export default function ColumnCell({ children, className, rootRef, ...props }: ComponentPropsWithRef<"div"> & {
    rootRef?: Ref<HTMLDivElement>
}) {
    return (
        <div className={`column-cell${className ? ` ${className}` : ""}`} ref={rootRef} {...props}>
            {children}
        </div>
    );
}