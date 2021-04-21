import React, { useCallback, useContext } from "react";
import { Item, Menu, useContextMenu } from "react-contexify";
import { ItemOrganizerContext } from "../../contexts/item-organizer-context";
import { RightClickContext } from "../../contexts/right-click-context";
import CourseColorCoding from "./items/CourseColorCoding";

/**
 * Returns an onContextMenu handler that will control the presentation of data cell context menus
 */
export function useDataCellContextMenuHandler(ctxID: string) {
    const { setItem } = useContext(RightClickContext);

    const { show: showContextMenu } = useContextMenu({
        id: ctxID
    });

    return useCallback((ev: React.MouseEvent) => {
        if (!(ev.target instanceof Element)) return setItem(null);

        let parent: Element | null = ev.target;
        while (parent) {
            if (parent.hasAttribute("attr-uri") && parent.hasAttribute("attr-course-id")) break;
            parent = parent.parentElement;
        }

        // right-click outside of a data cell
        if (!parent) return setItem(null);

        // update the context data
        setItem({
            itemURI: parent.getAttribute("attr-uri")!,
            courseID: parent.getAttribute("attr-course-id")!
        });
        
        // ready to go
        showContextMenu(ev);
    }, [setItem, showContextMenu]);
}

export default function DataCellContextMenu({ ctxID }: { ctxID: string }) {
    return (
        <Menu id={ctxID} animation={false}>
            <ItemOrganizerContext.Consumer>
                {({ pinItem, unpinItem, hideItem, unhideItem, hiddenItems, pinnedItems }) => (
                    <RightClickContext.Consumer>
                        {({ currentCourse: course, item }) => (
                            (item && course) ? (
                                <>
                                    <Item onClick={e => e.event.stopPropagation()} className="no-hover-bg">
                                        <CourseColorCoding course={course} />
                                    </Item>
                                    <Item onClick={hiddenItems.includes(item.itemURI) ? () => unhideItem(item.itemURI) : () => hideItem(item.itemURI)}>
                                        {hiddenItems.includes(item.itemURI) ? "Unhide" : "Hide"}
                                    </Item>
                                    <Item onClick={pinnedItems.includes(item.itemURI) ? () => unpinItem(item.itemURI) : () => pinItem(item.itemURI)}>
                                        {pinnedItems.includes(item.itemURI) ? "Unpin" : "Pin"}
                                    </Item>
                                </>
                            ) : null
                        )}
                    </RightClickContext.Consumer>
                )}
            </ItemOrganizerContext.Consumer>
        </Menu>
    );
}