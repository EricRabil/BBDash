import { RawDate } from "../transformers/spec";

export function parseDate(date: RawDate): Date {
    switch (typeof date) {
    case "string":
    case "number":
        return new Date(date);
    case "object":
        return date;
    }
}