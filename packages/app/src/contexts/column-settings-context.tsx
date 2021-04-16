import React, { createContext, PropsWithChildren, useCallback } from "react";
import { DataCellData, FilterableKey, SortableKey } from "../transformers/spec";
import { SortOrder } from "../utils/data-presentation";

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
}

export interface ColumnSettingsState {
    settings: Readonly<ColumnSettings>;
    setSettings: (settings: ColumnSettings) => void;
    deleteColumn: () => void;
    setKey: <Key extends keyof ColumnSettings>(key: Key, value: ColumnSettings[Key]) => void;
}

/**
 * Publicizes the column settings for the current column
 */
export const ColumnSettingsContext = createContext<ColumnSettingsState>({
    settings: { name: "Column" },
    deleteColumn: () => undefined,
    setSettings: () => undefined,
    setKey: () => undefined
});

export interface ColumnSettingsProviderProps { settings: ColumnSettings, deleteColumn: () => void, setSettings: (settings: ColumnSettings) => void }

export function ColumnSettingsProvider({ children, deleteColumn, settings, setSettings }: PropsWithChildren<ColumnSettingsProviderProps>) {
    const setKey: ColumnSettingsState["setKey"] = useCallback((key, value) => setSettings(Object.assign({}, settings, { [key]: value })), [settings, setSettings]);

    return (
        <ColumnSettingsContext.Provider value={{ settings, deleteColumn, setSettings, setKey }}>
            {children}
        </ColumnSettingsContext.Provider>
    );
}