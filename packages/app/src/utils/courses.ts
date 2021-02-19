import { Course } from "@bbdash/shared";

export function courseLink(course: Course, legacyURL?: string) {
    const url = new URL(course.externalAccessUrl);

    if (legacyURL) url.searchParams.set("legacyUrl", legacyURL);

    return url.toString();
}
