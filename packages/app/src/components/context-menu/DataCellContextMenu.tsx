import React, { useCallback, useContext } from "react";
import { Item, Menu, Separator, useContextMenu } from "react-contexify";
import { CourseBlacklistContext } from "../../contexts/course-blacklist-context";
import { ModifierKeyContext } from "../../contexts/modifier-key-context";
import { RightClickContext } from "../../contexts/right-click-context";
import ColumnContextSection from "./ColumnContextSection";
import ItemContextSection from "./ItemContextSection";
import CourseColorCoding from "./items/CourseColorCoding";
import FilterBehaviorContextItems from "./items/FilterBehaviorContextItems";

/**
 * Returns an onContextMenu handler that will control the presentation of data cell context menus
 */
export function useDataCellContextMenuHandler(ctxID: string) {
    const { setRawURI } = useContext(RightClickContext);

    const { show: showContextMenu } = useContextMenu({
        id: ctxID
    });

    return useCallback((ev: React.MouseEvent) => {
        if (!(ev.target instanceof Element)) return setRawURI(null);

        let parent: Element | null = ev.target;
        while (parent) {
            if (parent.hasAttribute("attr-uri")) break;
            parent = parent.parentElement;
        }

        // right-click outside of a data cell
        if (!parent) return setRawURI(null);

        // update the context data
        setRawURI(parent.getAttribute("attr-uri"));
        
        // ready to go
        showContextMenu(ev);
    }, [setRawURI, showContextMenu]);
}

export default function DataCellContextMenu({ ctxID }: { ctxID: string }) {
    const { locallyBlacklistedCourses, globallyBlacklistedCourses, setBlacklisted } = useContext(CourseBlacklistContext);
    const { alt, ctrl } = useContext(ModifierKeyContext);

    const { currentCourse: course, uri: item } = useContext(RightClickContext);

    const blacklistedCourses = alt ? globallyBlacklistedCourses : locallyBlacklistedCourses;

    const isBlacklisted = course?.id ? blacklistedCourses.includes(course.id) : false;

    const toggleBlacklisted = useCallback(() => {
        if (!course) return;
        setBlacklisted(course.id, !isBlacklisted, alt);
    }, [alt, isBlacklisted, course?.id, setBlacklisted]);

    return (
        <Menu id={ctxID} animation={false}>
            <ColumnContextSection />
            {
                course ? (
                    <Item onClick={e => e.event.stopPropagation()} className="no-hover-bg">
                        <CourseColorCoding course={course} />
                    </Item>
                ) : null
            }
            <ItemContextSection />
            {course ? (
                <>
                    <Item onClick={toggleBlacklisted}>
                        {isBlacklisted ? "Unhide" : "Hide"} Course {alt ? "Globally" : null}
                    </Item>
                    <Separator />
                </>
            ) : null}
            <FilterBehaviorContextItems />
            {ctrl ? (
                <>
                    <Separator />
                    <Item disabled={true}>
                        <strong>URI:</strong> {item?.raw || "null"}
                    </Item>
                </>
            ) : null}
        </Menu>
    );
}