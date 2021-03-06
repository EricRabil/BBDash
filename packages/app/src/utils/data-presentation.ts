import { ContentCategories, ContentType } from "@bbdash/shared";
import { ColumnSettings } from "../contexts/column-settings-context";
import { DataCellData, ENTRY_CONTENT_CATEGORY, ENTRY_DUE_DATE, ENTRY_EMPTY, ENTRY_TIME, ENTRY_TITLE, SortableKey } from "../transformers/spec";
import { parseDate } from "./date";

export enum SortOrder {
    ascending = "ascending",
    descending = "descending"
}

export const PossibleSortOrders = Object.values(SortOrder);

/**
 * Filters an array of cell data according to user preferences
 * @param data data to filter
 * @param param1 user preferences
 * @returns filtered array of cell data
 */
export function filterData(data: DataCellData[], { filters }: {
    filters: NonNullable<ColumnSettings["filters"]>
}): DataCellData[] {
    for (const [key, value] of Object.entries(filters)) {
        switch (key) {
        case ENTRY_CONTENT_CATEGORY:
            // no valid filters, skip filtering to prevent an empty list
            if ((value as unknown[]).filter(item => item).length === 0) break;

            data = data.filter(data => {
                if (typeof data.filterables?.[ENTRY_CONTENT_CATEGORY] !== "string") return false;
                if (!(value as (keyof typeof ContentCategories)[]).some(category => ContentCategories[category].includes(data.filterables![ENTRY_CONTENT_CATEGORY]! as ContentType))) return false;
                return true;
            });

            break;
        case ENTRY_EMPTY:
            data = data.filter(data => {
                // not a boolean, don't try to check
                if (typeof data.filterables?.[ENTRY_EMPTY] !== "boolean") return true;
                return data.filterables[ENTRY_EMPTY] === value;
            });
            
            break;
        case ENTRY_DUE_DATE:
            if (!value) break;

            data = data.filter(data => {
                if (typeof data.filterables?.[ENTRY_DUE_DATE] !== "boolean") return true;
                return data.filterables[ENTRY_DUE_DATE] === value;
            });
            
            break;
        default:
            break;
        }
    }

    return data;
}

/**
 * Sorts an array of cell data according to user preference
 * @param data data to sort
 * @param param1 user preference
 * @returns sorted array of cell data
 */
export function sortData(data: DataCellData[], { sortOrder, sortBy }: {
    sortOrder?: SortOrder,
    sortBy: SortableKey
}) {
    // Inverts the sorting values when the user wants descending order
    const LESS_THAN = sortOrder === SortOrder.descending ? 1 : -1;
    const GREATER_THAN = sortOrder === SortOrder.descending ? -1 : 1;

    return data.sort(({ sortables: sortables1 }, { sortables: sortables2 }) => {
        if (!sortables1?.[sortBy] && !sortables2?.[sortBy]) return 0;
        else if (!sortables1?.[sortBy]) return LESS_THAN;
        else if (!sortables2?.[sortBy]) return GREATER_THAN;
            
        switch (sortBy) {
        case ENTRY_TIME:
        case ENTRY_DUE_DATE:
            const date1 = parseDate(sortables1[sortBy]!), date2 = parseDate(sortables2[sortBy]!);

            if (date1 > date2) return GREATER_THAN;
            else if (date1 < date2) return LESS_THAN;
            else return 0;
        case ENTRY_TITLE:
            const title1 = sortables1[sortBy]!, title2 = sortables2[sortBy]!;

            let sortValue = title1.localeCompare(title2);
            if (sortOrder === SortOrder.descending) sortValue *= -1;

            return sortValue;
        }
    });
}