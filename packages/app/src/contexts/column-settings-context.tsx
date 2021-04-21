import React, { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from "react";
import { DataCellData, FilterableKey, SortableKey } from "../transformers/spec";
import { SortOrder } from "../utils/data-presentation";
import { ItemOrganizerContext } from "./item-organizer-context";

type FilterSetting<T extends string | boolean | undefined> =
    T extends string | undefined ? string[]
  : T extends boolean | undefined ? boolean
  : never;

export interface ColumnSettings {
    sortBy?: SortableKey;
    sortOrder?: SortOrder;
    filters?: {
        [Key in FilterableKey]?: FilterSetting<NonNullable<DataCellData["filterables"]>[Key]>;
    };
    name?: string;
    pinned?: string[];
    hidden?: string[];
}

export interface ColumnSettingsState {
    settings: Readonly<ColumnSettings>;
    id: number;
    setSettings: (settings: ColumnSettings) => void;
    deleteColumn: () => void;
    setKey: <Key extends keyof ColumnSettings>(key: Key, value: ColumnSettings[Key]) => void;
}

/**
 * Publicizes the column settings for the current column
 */
export const ColumnSettingsContext = createContext<ColumnSettingsState>({
    settings: { name: "Column" },
    id: 0,
    deleteColumn: () => undefined,
    setSettings: () => undefined,
    setKey: () => undefined
});

export interface ColumnSettingsProviderProps {
    settings: ColumnSettings;
    deleteColumn: () => void;
    setSettings: (settings: ColumnSettings) => void;
    columnUID: number;
}

function ColumnBackedItemOrganizerProvider({ children }: PropsWithChildren<{}>) {
    const { settings, setKey } = useContext(ColumnSettingsContext);

    const { hiddenItems: globallyHiddenItems } = useContext(ItemOrganizerContext);
    const hiddenItems = useMemo(() => globallyHiddenItems.concat(settings.hidden || []), [globallyHiddenItems, settings.hidden]);
    const pinnedItems = useMemo(() => settings.pinned || [], [settings.pinned]);
    const [ temporarilyShowHiddenItems, setTemporarilyShowHiddenItems ] = useState(false);

    console.log("hey girl");

    return (
        <ItemOrganizerContext.Provider value={{
            hiddenItems,
            hideItem: useCallback(itemID => {
                if (hiddenItems.includes(itemID)) return;
                setKey("hidden", hiddenItems.concat(itemID));
            }, [hiddenItems, setKey]),
            unhideItem: useCallback(itemID => {
                if (!hiddenItems.includes(itemID)) return;
                setKey("hidden", hiddenItems.filter(itemID1 => itemID !== itemID1));
            }, [hiddenItems, setKey]),
            unhideAllItems: useCallback(() => {
                setKey("hidden", []);
            }, [setKey]),
            pinnedItems,
            pinItem: useCallback(itemID => {
                if (pinnedItems.includes(itemID)) return;
                console.log("hey girl hey!");
                setKey("pinned", pinnedItems.concat(itemID));
            }, [pinnedItems, setKey]),
            unpinItem: useCallback(itemID => {
                if (!pinnedItems.includes(itemID)) return;
                setKey("pinned", pinnedItems.filter(itemID1 => itemID !== itemID1));
            }, [pinnedItems, setKey]),
            unpinAllItems: useCallback(() => {
                setKey("pinned", []);
            }, [setKey]),
            temporarilyShowHiddenItems,
            setTemporarilyShowHiddenItems
        }}>
            {children}
        </ItemOrganizerContext.Provider>
    );
}

export function ColumnSettingsProvider({ children, columnUID: id, deleteColumn, settings, setSettings }: PropsWithChildren<ColumnSettingsProviderProps>) {
    const setKey: ColumnSettingsState["setKey"] = useCallback((key, value) => setSettings(Object.assign({}, settings, { [key]: value })), [settings, setSettings]);

    return (
        <ColumnSettingsContext.Provider value={{ settings, id, deleteColumn, setSettings, setKey }}>
            <ColumnBackedItemOrganizerProvider>
                {children}
            </ColumnBackedItemOrganizerProvider>
        </ColumnSettingsContext.Provider>
    );
}