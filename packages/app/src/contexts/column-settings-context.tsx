import React, { createContext, PropsWithChildren, useCallback, useContext } from "react";
import { DataCellData, ENTRY_CONTENT_CATEGORY, FilterableKey, SortableKey } from "../transformers/spec";
import { SortOrder } from "../utils/data-presentation";
import { CourseBlacklistProvider } from "./course-blacklist-context";
import { FilterBehaviorProvider } from "./filter-behavior-context";
import { ItemOrganizerProvider } from "./item-organizer-context";

type FilterSetting<T extends string | boolean | undefined> =
    T extends string | undefined ? string[]
  : T extends boolean | undefined ? boolean
  : never;

export interface ColumnSettings {
    sortBy?: SortableKey;
    sortOrder: SortOrder;
    filters: {
        [Key in FilterableKey]?: FilterSetting<NonNullable<DataCellData["filterables"]>[Key]>;
    };
    name?: string;
    pinned: string[];
    hidden: string[];
    blacklistedCourses: string[];
    headerColor: number;
}

export interface ColumnSettingsState {
    settings: Readonly<ColumnSettings>;
    id: number;
    setSettings: (settings: ColumnSettings) => void;
    deleteColumn: () => void;
    setKey: <Key extends keyof ColumnSettings>(key: Key, value: ColumnSettings[Key]) => void;
}

export const DEFAULT_COLUMN_SETTINGS: (name?: string) => ColumnSettings = (name = "Column") => ({
    name,
    pinned: [],
    hidden: [],
    blacklistedCourses: [],
    filters: {
        [ENTRY_CONTENT_CATEGORY]: []
    },
    sortOrder: SortOrder.descending,
    headerColor: -1
});

/**
 * Publicizes the column settings for the current column
 */
export const ColumnSettingsContext = createContext<ColumnSettingsState>({
    settings: DEFAULT_COLUMN_SETTINGS(),
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

function ColumnBackedCourseBlacklistProvider({ children }: PropsWithChildren<{}>) {
    const [ blacklistedCourses, setBlacklistedCourses ] = usePreference("blacklistedCourses");

    return (
        <CourseBlacklistProvider blacklistedCourses={blacklistedCourses} setBlacklistedCourses={setBlacklistedCourses}>
            {children}
        </CourseBlacklistProvider>
    );
}

export function usePreference<Key extends keyof ColumnSettings>(key: Key): [ColumnSettings[Key], (newValue: ColumnSettings[Key]) => void] {
    const { settings, setKey } = useContext(ColumnSettingsContext);

    const setValue = useCallback((newValue: ColumnSettings[Key]) => setKey(key, newValue), [setKey]);

    return [settings[key], setValue];
}

function ColumnBackedItemOrganizerProvider({ children }: PropsWithChildren<{}>) {
    const [ hiddenItems, setHiddenItems ] = usePreference("hidden");
    const [ pinnedItems, setPinnedItems ] = usePreference("pinned");
    
    return (
        <ItemOrganizerProvider hiddenItems={hiddenItems} setHiddenItems={setHiddenItems} pinnedItems={pinnedItems} setPinnedItems={setPinnedItems}>
            {children}
        </ItemOrganizerProvider>
    );
}

export function ColumnSettingsProvider({ children, columnUID: id, deleteColumn, settings, setSettings }: PropsWithChildren<ColumnSettingsProviderProps>) {
    const setKey: ColumnSettingsState["setKey"] = useCallback((key, value) => setSettings(Object.assign({}, settings, { [key]: value })), [settings, setSettings]);

    return (
        <ColumnSettingsContext.Provider value={{ settings, id, deleteColumn, setSettings, setKey }}>
            <FilterBehaviorProvider>
                <ColumnBackedItemOrganizerProvider>
                    <ColumnBackedCourseBlacklistProvider>
                        {children}
                    </ColumnBackedCourseBlacklistProvider>
                </ColumnBackedItemOrganizerProvider>
            </FilterBehaviorProvider>
        </ColumnSettingsContext.Provider>
    );
}