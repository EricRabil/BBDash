import { Course } from "@bbdash/shared";

/**
 * Formats the URL to go to the homepage of a course
 * @param course course object
 * @param legacyURL legacy URL, if any
 */
export function courseLink(course: Course, legacyURL?: string) {
    const url = new URL(course.externalAccessUrl);

    if (legacyURL) url.searchParams.set("legacyUrl", legacyURL);

    return url.toString();
}
