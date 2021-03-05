import { Course } from "@bbdash/shared";
import React, { ComponentPropsWithRef, CSSProperties, MutableRefObject, PropsWithChildren, RefCallback, useContext, useEffect, useMemo, useState } from "react";
import { Item, ItemParams, Menu, useContextMenu } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";
import { createPortal } from "react-dom";
import { ColorCodingContext } from "../contexts/color-coding-context";
import CourseColorCoding from "./context-menu/CourseColorCoding";

function CTXPortal({ children }: PropsWithChildren<{}>) {
    return createPortal(children, document.getElementById("ctx")!);
}

let courseCounter = 0;

/**
 * Layout component for cells of data in a column
 * @param opts cell options
 */
export default function ColumnCell({ children, className, rootRef, course, style, ...props }: ComponentPropsWithRef<"div"> & {
    rootRef?: RefCallback<HTMLDivElement> | MutableRefObject<HTMLDivElement>;
    course?: Course;
}) {
    const [referenceElement, setReferenceElement] = useState(null as unknown as HTMLDivElement | null);
    const ctxID = useMemo(() => Date.now() + (courseCounter++), [course?.id]);
    const { courses } = useContext(ColorCodingContext);
    const { show } = useContextMenu({
        id: ctxID,
    });

    const handleItemClick = ({ event }: ItemParams) => {
        event?.stopPropagation();
    };

    useEffect(() => {
        if (rootRef) {
            if (typeof rootRef === "function") rootRef(referenceElement);
            else rootRef.current = referenceElement as HTMLDivElement;
        }
    }, [referenceElement]);

    return (
        <>
            <div onContextMenu={course ? show : undefined} ref={setReferenceElement} style={{
                "--cellBackground": course && courses[course.id] || undefined,
                ...(style || {})
            } as CSSProperties & { "--cellBackground": string | undefined }} className={`column-cell${className ? ` ${className}` : ""}`} {...props}>
                {children}
            </div>

            <CTXPortal>
                <Menu id={ctxID} animation={false}>
                    {
                        course ? (
                            <Item onClick={handleItemClick} className="no-hover-bg">
                                <CourseColorCoding course={course} />
                            </Item>
                        ) : []
                    }
                </Menu>
            </CTXPortal>
        </>
    );
}