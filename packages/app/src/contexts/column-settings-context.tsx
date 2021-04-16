import React, { cloneElement, createContext, PropsWithChildren, ReactNode, useCallback } from "react";
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

export const ColumnSettingsContext = createContext<ColumnSettingsState>({
    settings: { name: "Column" },
    deleteColumn: () => undefined,
    setSettings: () => undefined,
    setKey: () => undefined
});

function insertProps(children: ReactNode, props: object): ReactNode {
    const elements = React.Children.toArray(children);

    if (elements.length === 1) return cloneElement(elements[0] as any, props);
    else if (elements.length > 0) {
        return [cloneElement(elements[0] as any, props), ...elements.slice(1)];
    }
    else return [];
}

export function ColumnSettingsProvider({ children, deleteColumn, settings, setSettings, ...props }: PropsWithChildren<{ settings: ColumnSettings, deleteColumn: () => void, setSettings: (settings: ColumnSettings) => void }>) {
    const setKey: ColumnSettingsState["setKey"] = useCallback((key, value) => setSettings(Object.assign({}, settings, { [key]: value })), [settings, setSettings]);

    return (
        <ColumnSettingsContext.Provider value={{ settings, deleteColumn, setSettings, setKey }}>
            {insertProps(children, props)}
        </ColumnSettingsContext.Provider>
    );
}