import { getPersistentValue } from "react-use-persistent";
import { ColumnItem } from "../hooks/usePersistentColumns";

export const persistentColumnsRef = getPersistentValue<ColumnItem[]>("columns", []);

export function unarchiveObject<U>(key: string): Record<string, U> {
    const cached = localStorage.getItem(key);
    
    try {
        if (cached) return JSON.parse(cached);
    } finally {
        /* eslint-disable-next-line */
        return {};
    }
}