import React, { createContext, PropsWithChildren, useCallback, useState } from "react";
import { usePersistent } from "react-use-persistent";

export interface ItemOrganizerContextState {
    hiddenItems: readonly string[];
    pinnedItems: readonly string[];
    temporarilyShowHiddenItems: boolean;
    setTemporarilyShowHiddenItems(newValue: boolean): void;
    hideItem(itemID: string): void;
    pinItem(itemID: string): void;
    unpinItem(itemID: string): void;
    unpinAllItems(): void;
    unhideAllItems(): void;
    unhideItem(itemID: string): void;
}

const noop = () => undefined;

export const ItemOrganizerContext = createContext<ItemOrganizerContextState>({
    hiddenItems: [],
    pinnedItems: [],
    temporarilyShowHiddenItems: false,
    setTemporarilyShowHiddenItems: noop,
    hideItem: noop,
    pinItem: noop,
    unpinItem: noop,
    unpinAllItems: noop,
    unhideAllItems: noop,
    unhideItem: noop
});

const splice: <T>(array: T[], setArray: (array: T[]) => void, item: T) => void = (array, setArray, item) => {
    if (!array.includes(item)) return;
    array = array.slice();
    array.splice(array.indexOf(item), 1);
    setArray(array);
};
const push: <T>(array: T[], setArray: (array: T[]) => void, item: T) => void = (array, setArray, item) => {
    if (array.includes(item)) return;
    setArray(array.concat(item));
};

export function ItemOrganizerProvider({ children }: PropsWithChildren<{}>) {
    const [ temporarilyShowHiddenItems, setTemporarilyShowHiddenItems ] = useState(false);
    const [ hiddenItems, setHiddenItems, persistentHiddenInner ] = usePersistent<string[]>("hidden-items", []);
    const [ pinnedItems, setPinnedItems, persistentPinnedInner ] = usePersistent<string[]>("pinned-items", []);

    return (
        <ItemOrganizerContext.Provider value={{
            hiddenItems,
            hideItem: useCallback(itemID => push(persistentHiddenInner.value, setHiddenItems, itemID), []),
            unhideItem: useCallback(itemID => splice(persistentHiddenInner.value, setHiddenItems, itemID), []),
            unhideAllItems: () => setHiddenItems([]),
            pinnedItems,
            pinItem: useCallback(itemID => push(persistentPinnedInner.value, setPinnedItems, itemID), []),
            unpinItem: useCallback(itemID => splice(persistentPinnedInner.value, setPinnedItems, itemID), []),
            unpinAllItems: () => setPinnedItems([]),
            temporarilyShowHiddenItems,
            setTemporarilyShowHiddenItems
        }}>
            {children}
        </ItemOrganizerContext.Provider>
    );
}