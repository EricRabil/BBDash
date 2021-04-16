import { useCallback } from "react";
import { usePersistent } from "react-use-persistent";

export interface ColumnItem {
    column: number;
    id: string;
    preferences: object;
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
            column: 0,
            preferences: {}
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