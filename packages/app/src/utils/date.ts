import { RawDate } from "../transformers/spec";

/**
 * Takes a string, number, or date, and returns a date.
 * @param date value to resolve
 * @returns a date
 */
export function parseDate(date: RawDate): Date {
    switch (typeof date) {
    case "string":
    case "number":
        return new Date(date);
    case "object":
        return date;
    }
}