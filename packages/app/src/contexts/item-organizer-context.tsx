import React, { createContext, PropsWithChildren, useCallback, useContext } from "react";
import { usePersistent } from "react-use-persistent";
import { FilterBehaviorContext } from "./filter-behavior-context";

export interface ItemOrganizerContextState {
    hiddenItems: readonly string[];
    locallyHiddenItems: readonly string[];
    globallyHiddenItems: readonly string[];
    setHidden: (itemID: string, hidden: boolean, globally?: boolean) => void;
    unhideAllItems: (globally?: boolean) => void;
    pinnedItems: readonly string[];
    locallyPinnedItems: readonly string[];
    globallyPinnedItems: readonly string[];
    setPinned: (itemID: string, pinned: boolean, globally?: boolean) => void;
    unpinAllItems: (globally?: boolean) => void;
    isDefault: boolean;
}

/**
 * Manages the hiding and pinning of specific items
 */
export const ItemOrganizerContext = createContext<ItemOrganizerContextState>({
    hiddenItems: [],
    locallyHiddenItems: [],
    globallyHiddenItems: [],
    setHidden: () => undefined,
    unhideAllItems: () => undefined,
    pinnedItems: [],
    locallyPinnedItems: [],
    globallyPinnedItems: [],
    setPinned: () => undefined,
    unpinAllItems: () => undefined,
    isDefault: true
});

export function PersistentItemOrganizerProvider({ children, hiddenKey, pinnedKey }: PropsWithChildren<{ hiddenKey: string, pinnedKey: string }>) {
    const [ hiddenItems, setHiddenItems ] = usePersistent<string[]>(hiddenKey, []);
    const [ pinnedItems, setPinnedItems ] = usePersistent<string[]>(pinnedKey, []);

    return (
        <ItemOrganizerProvider hiddenItems={hiddenItems} setHiddenItems={setHiddenItems} pinnedItems={pinnedItems} setPinnedItems={setPinnedItems}>
            {children}
        </ItemOrganizerProvider>
    );
}

export function ItemOrganizerProvider({ children, hiddenItems: locallyHiddenItems, setHiddenItems: setLocallyHiddenItems, pinnedItems: locallyPinnedItems, setPinnedItems: setLocallyPinnedItems }: PropsWithChildren<{
    hiddenItems: string[],
    setHiddenItems: (items: string[]) => void,
    pinnedItems: string[],
    setPinnedItems: (items: string[]) => void
}>) {
    const { uriFiltersAreDisabled } = useContext(FilterBehaviorContext);
    const {
        hiddenItems: globallyHiddenItems,
        setHidden: setHiddenGlobally,
        unhideAllItems: unhideAllItemsGlobally,
        pinnedItems: globallyPinnedItems,
        setPinned: setPinnedGlobally,
        unpinAllItems: unpinAllItemsGlobally,
        isDefault: isRoot
    } = useContext(ItemOrganizerContext);

    const setHidden = useCallback((itemID: string, hidden: boolean, globally?: boolean) => {
        if (globally && !isRoot) setHiddenGlobally(itemID, hidden, globally);
        else if (hidden && !locallyHiddenItems.includes(itemID)) setLocallyHiddenItems(locallyHiddenItems.concat(itemID));
        else if (!hidden && locallyHiddenItems.includes(itemID)) setLocallyHiddenItems(locallyHiddenItems.filter(itemID1 => itemID !== itemID1));
    }, [isRoot, setHiddenGlobally, locallyHiddenItems, setLocallyHiddenItems]);

    const setPinned = useCallback((itemID: string, pinned: boolean, globally?: boolean) => {
        if (globally && !isRoot) setPinnedGlobally(itemID, pinned, globally);
        else if (pinned && !locallyPinnedItems.includes(itemID)) setLocallyPinnedItems(locallyPinnedItems.concat(itemID));
        else if (!pinned && locallyPinnedItems.includes(itemID)) setLocallyPinnedItems(locallyPinnedItems.filter(itemID1 => itemID !== itemID1));
    }, [isRoot, setPinnedGlobally, locallyPinnedItems, setLocallyPinnedItems]);

    const unhideAllItems = useCallback((globally?: boolean) => {
        if (globally && !isRoot) unhideAllItemsGlobally(globally);
        else setLocallyHiddenItems([]);
    }, [isRoot, unhideAllItemsGlobally, setLocallyHiddenItems]);

    const unpinAllItems = useCallback((globally?: boolean) => {
        if (globally && !isRoot) unpinAllItemsGlobally(globally);
        else setLocallyPinnedItems([]);
    }, [isRoot, unpinAllItemsGlobally, setLocallyPinnedItems]);

    const hiddenItems = uriFiltersAreDisabled ? [] : globallyHiddenItems.concat(locallyHiddenItems);
    const pinnedItems = uriFiltersAreDisabled ? [] : globallyPinnedItems.concat(locallyPinnedItems);

    return (
        <ItemOrganizerContext.Provider value={{
            hiddenItems,
            setHidden,
            locallyHiddenItems,
            globallyHiddenItems: isRoot ? locallyHiddenItems : globallyHiddenItems,
            unhideAllItems,
            pinnedItems,
            locallyPinnedItems: pinnedItems,
            globallyPinnedItems: isRoot ? locallyPinnedItems : globallyPinnedItems,
            setPinned,
            unpinAllItems,
            isDefault: false
        }}>
            {children}
        </ItemOrganizerContext.Provider>
    );
}