import React, { useCallback, useContext } from "react";
import { Item, Separator } from "react-contexify";
import { ItemOrganizerContext } from "../../contexts/item-organizer-context";
import { ModifierKeyContext } from "../../contexts/modifier-key-context";
import { RightClickContext } from "../../contexts/right-click-context";

export default function ItemContextSection() {
    const { uri: item }=  useContext(RightClickContext);
    const { alt } = useContext(ModifierKeyContext);

    const {
        locallyHiddenItems,
        globallyHiddenItems,
        setHidden,
        locallyPinnedItems,
        globallyPinnedItems,
        setPinned
    } = useContext(ItemOrganizerContext);

    const hiddenItems = alt ? globallyHiddenItems : locallyHiddenItems;
    const pinnedItems = alt ? globallyPinnedItems : locallyPinnedItems;

    const isHidden = item?.raw ? hiddenItems.includes(item.raw) : false;
    const isPinned = item?.raw ? pinnedItems.includes(item.raw) : false;

    const toggleHidden = useCallback(() => {
        if (!item) return;
        setHidden(item.raw, !isHidden, alt);
    }, [alt, isHidden, item?.raw, setHidden]);

    const togglePinned = useCallback(() => {
        if (!item) return;
        setPinned(item.raw, !isPinned, alt);
    }, [alt, isPinned, item?.raw, setPinned]);

    if (!item || !(item.isStreamEntry || item.isGradebook || item.isCourseContentItem)) return null;

    return (
        <>
            <Item onClick={toggleHidden}>
                {isHidden ? "Unhide" : "Hide"} Item {alt ? "Globally" : null}
            </Item>
            <Item onClick={togglePinned}>
                {isPinned ? "Unpin" : "Pin"} Item {alt ? "Globally" : null}
            </Item>
            <Separator />
        </>
    );
}