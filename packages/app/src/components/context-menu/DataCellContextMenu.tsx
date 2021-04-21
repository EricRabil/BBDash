import React, { useCallback, useContext } from "react";
import { Item, Menu, Separator, useContextMenu } from "react-contexify";
import { CourseBlacklistContext } from "../../contexts/course-blacklist-context";
import { ItemOrganizerContext } from "../../contexts/item-organizer-context";
import { ModifierKeyContext } from "../../contexts/modifier-key-context";
import { RightClickContext } from "../../contexts/right-click-context";
import CourseColorCoding from "./items/CourseColorCoding";
import FilterBehaviorContextItems from "./items/FilterBehaviorContextItems";

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
    const { locallyBlacklistedCourses, globallyBlacklistedCourses, setBlacklisted } = useContext(CourseBlacklistContext);
    const { alt } = useContext(ModifierKeyContext);

    const {
        locallyHiddenItems,
        globallyHiddenItems,
        setHidden,
        locallyPinnedItems,
        globallyPinnedItems,
        setPinned
    } = useContext(ItemOrganizerContext);
    const { currentCourse: course, item } = useContext(RightClickContext);

    const hiddenItems = alt ? globallyHiddenItems : locallyHiddenItems;
    const pinnedItems = alt ? globallyPinnedItems : locallyPinnedItems;
    const blacklistedCourses = alt ? globallyBlacklistedCourses : locallyBlacklistedCourses;

    const isHidden = item?.itemURI ? hiddenItems.includes(item.itemURI) : false;
    const isPinned = item?.itemURI ? pinnedItems.includes(item.itemURI) : false;
    const isBlacklisted = course?.id ? blacklistedCourses.includes(course.id) : false;

    const toggleHidden = useCallback(() => {
        if (!item) return;
        setHidden(item.itemURI, !isHidden, alt);
    }, [alt, isHidden, item?.itemURI, setHidden]);

    const togglePinned = useCallback(() => {
        if (!item) return;
        setPinned(item.itemURI, !isPinned, alt);
    }, [alt, isPinned, item?.itemURI, setPinned]);

    const toggleBlacklisted = useCallback(() => {
        if (!course) return;
        setBlacklisted(course.id, !isBlacklisted, alt);
    }, [alt, isBlacklisted, course?.id, setBlacklisted]);

    return (
        <Menu id={ctxID} animation={false}>
            {(item && course) ? (
                <>
                    <Item onClick={e => e.event.stopPropagation()} className="no-hover-bg">
                        <CourseColorCoding course={course} />
                    </Item>
                    <Item onClick={toggleHidden}>
                        {isHidden ? "Unhide" : "Hide"} Item {alt ? "Globally" : null}
                    
                    </Item>
                    <Item onClick={togglePinned}>
                        {isPinned ? "Unpin" : "Pin"} Item {alt ? "Globally" : null}
                    </Item>
                </>
            ) : null}
            {course ? (
                <>
                    <Item onClick={toggleBlacklisted}>
                        {isBlacklisted ? "Unhide" : "Hide"} Course {alt ? "Globally" : null}
                    </Item>
                </>
            ) : null}
            <Separator />
            <FilterBehaviorContextItems />
        </Menu>
    );
}