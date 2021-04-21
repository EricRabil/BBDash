import { useCallback } from "react";
import { getPersistentValue, usePersistent } from "react-use-persistent";
import { ColumnSettings, DEFAULT_COLUMN_SETTINGS } from "../contexts/column-settings-context";

export interface ColumnItem {
    column: number;
    id: string;
    uid: number;
    preferences: ColumnSettings;
}

const columnIDCounter = getPersistentValue<number>("column-id-counter", 0);

function nextColumnID(): number {
    const nextID = columnIDCounter.value;
    columnIDCounter.value += 1;
    return nextID;
}

/**
 * Creates a set of persistent APIs for managing columns and their order in the layout track
 */
export function usePersistentColumns(): [ColumnItem[], (items: ColumnItem[]) => void, {
    addColumn(id: string): void;
    removeColumn(index: number): void;
    updatePreferences(index: number, preferences: object): void;
}] {
    // All column items
    const [columnItems, setColumnItems] = usePersistent<ColumnItem[]>("columns", []);

    /**
     * Inserts a column with the given ID at the start of the track
     * @param id id of the column being inserted
     */
    const addColumn = useCallback((id: string) => {
        setColumnItems(columnItems.concat({
            id,
            uid: nextColumnID(),
            column: 0,
            preferences: DEFAULT_COLUMN_SETTINGS()
        }));
    }, [setColumnItems, columnItems]);

    /**
     * Removes a column at the given position on the track
     * @param index index of the position to delete
     */
    const removeColumn = useCallback((index: number) => {
        const newColumnItems = columnItems.slice();

        newColumnItems.splice(index, 1);

        setColumnItems(newColumnItems);
    }, [columnItems, setColumnItems]);

    /**
     * Update the preferences of a column at the given track position
     * @param index position in the track
     * @param preferences preferences to merge using
     */
    const updatePreferences = useCallback((index: number, preferences: object) => {
        setColumnItems(Object.assign([], columnItems, {
            [index]: {
                ...columnItems[index],
                preferences
            }
        }));
    }, [setColumnItems, columnItems]);

    return [columnItems, setColumnItems, {
        addColumn,
        removeColumn,
        updatePreferences
    }];
}

export default usePersistentColumns;