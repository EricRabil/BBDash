import { useEffect, useState } from "react";

export interface ColumnItem {
    column: number;
    id: string;
    preferences: object | undefined;
  }
  
export function readColumnItems(): ColumnItem[] {
    const items = localStorage.getItem("columns");
  
    if (!items) return [];
    else try {
        return JSON.parse(items);
    } catch {
        return [];
    }
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
    const [columnItems, setColumnItems] = useState(readColumnItems());
  
    useEffect(() => {
        localStorage.setItem("columns", JSON.stringify(columnItems));
    }, [columnItems]);

    /**
     * Inserts a column with the given ID at the start of the track
     * @param id id of the column being inserted
     */
    function addColumn(id: string) {
        setColumnItems(columnItems.concat({
            id,
            column: 0,
            preferences: {}
        }));
    }

    /**
     * Removes a column at the given position on the track
     * @param index index of the position to delete
     */
    function removeColumn(index: number) {
        const newColumnItems = columnItems.slice();

        newColumnItems.splice(index, 1);

        setColumnItems(newColumnItems);
    }

    /**
     * Update the preferences of a column at the given track position
     * @param index position in the track
     * @param preferences preferences to merge using
     */
    function updatePreferences(index: number, preferences: object) {
        setColumnItems(Object.assign([], columnItems, {
            [index]: {
                ...columnItems[index],
                preferences
            }
        }));
    }
  
    return [columnItems, setColumnItems, {
        addColumn,
        removeColumn,
        updatePreferences
    }];
}

export default usePersistentColumns;