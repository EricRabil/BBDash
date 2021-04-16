import { DateTime } from "luxon";

export const formatDate = (date?: string | null) => date ? DateTime.fromJSDate(new Date(date)).toLocaleString(DateTime.DATETIME_FULL) : null;
