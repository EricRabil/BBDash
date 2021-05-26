import React, { createContext, PropsWithChildren, useCallback, useContext, useMemo } from "react";
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
    blacklistedCourses: string[];
    filters: {
        [Key in FilterableKey]?: FilterSetting<NonNullable<DataCellData["filterables"]>[Key]>;
    };
    name?: string;
    pinned: string[];
    hidden: string[];
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
    return (
        <PreferenceConsumer preferenceKey="blacklistedCourses">
            {([ blacklistedCourses, setBlacklistedCourses ]) => (
                <CourseBlacklistProvider blacklistedCourses={blacklistedCourses} setBlacklistedCourses={setBlacklistedCourses}>
                    {children}
                </CourseBlacklistProvider>
            )}
        </PreferenceConsumer>
    );
}

export type PreferenceView<Key extends keyof ColumnSettings> = [ColumnSettings[Key], (newValue: ColumnSettings[Key]) => void];

export function usePreference<Key extends keyof ColumnSettings>(key: Key): PreferenceView<Key> {
    const { settings, setKey } = useContext(ColumnSettingsContext);

    const setValue = useCallback((newValue: ColumnSettings[Key]) => setKey(key, newValue), [setKey]);

    return [settings[key], setValue];
}

type BulkPreferenceView<Keys extends keyof ColumnSettings> = {
    [Key in Keys]: PreferenceView<Key>
};

export function usePreferences<Key extends keyof ColumnSettings>(keys: Key[]): BulkPreferenceView<Key> {
    const { settings, setKey } = useContext(ColumnSettingsContext);
    
    return useMemo(() => keys.reduce((acc, key) => {
        acc[key] = [settings[key], (newValue) => setKey(key, newValue)];

        return acc;
    }, {} as BulkPreferenceView<Key>), keys.map(key => settings[key]));
}

export function PreferenceConsumer<Key extends keyof ColumnSettings>({ preferenceKey, children }: { preferenceKey: Key, children: (preference: PreferenceView<Key>) => React.ReactNode}) {
    return (
        <>
            {children(usePreference(preferenceKey))}
        </>
    );
}

export function BulkPreferenceConsumer<Key extends keyof ColumnSettings>({ preferenceKeys, children }: { preferenceKeys: Key[], children: (preference: BulkPreferenceView<Key>) => React.ReactNode}) {
    return (
        <>
            {children(usePreferences(preferenceKeys))}
        </>
    );
}

function ColumnBackedItemOrganizerProvider({ children }: PropsWithChildren<{}>) {
    return (
        <BulkPreferenceConsumer preferenceKeys={["hidden", "pinned"]}>
            {({ hidden: [ hiddenItems, setHiddenItems ], pinned: [ pinnedItems, setPinnedItems ]}) => (
                <ItemOrganizerProvider hiddenItems={hiddenItems} setHiddenItems={setHiddenItems} pinnedItems={pinnedItems} setPinnedItems={setPinnedItems}>
                    {children}
                </ItemOrganizerProvider>
            )}
        </BulkPreferenceConsumer>
    );
}

export function ColumnSettingsProvider({ children, columnUID: id, deleteColumn, settings, setSettings }: PropsWithChildren<ColumnSettingsProviderProps>) {
    const setKey: ColumnSettingsState["setKey"] = useCallback((key, value) => setSettings(Object.assign({}, settings, { [key]: value })), [setSettings, settings]);

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