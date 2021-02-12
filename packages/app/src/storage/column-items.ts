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
  
export function usePersistentColumns(): [ColumnItem[], (items: ColumnItem[]) => void, {
    addColumn(id: string): void;
    removeColumn(index: number): void;
    updatePreferences(index: number, preferences: object): void;
}] {
    const [columnItems, setColumnItems] = useState(readColumnItems());
  
    useEffect(() => {
        localStorage.setItem("columns", JSON.stringify(columnItems));
    }, [columnItems]);

    function addColumn(id: string) {
        setColumnItems(columnItems.concat({
            id,
            column: 0,
            preferences: {}
        }));
    }

    function removeColumn(index: number) {
        const newColumnItems = columnItems.slice();

        newColumnItems.splice(index, 1);

        setColumnItems(newColumnItems);
    }

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