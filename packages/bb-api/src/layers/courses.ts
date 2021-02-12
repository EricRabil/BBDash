
import { Course, CourseContentItem, CourseEnrollment, GradeMapping, PaginatedQuery } from "@bbdash/shared";
import APILayer from "../structs/layer";
import { isAxiosError } from "../util";

interface CourseListingResult {
    coursesWithActivity: string[];
    coursesWithGrades: string[];
}

type MembershipEnrollmentListing = PaginatedQuery<CourseEnrollment>;

interface ParentItem {
    availability: {
        available: "Yes" | "No";
    };
    id: string;
    hasChildren: true;
}

/**
 * Determines whether the given item has children
 * @param item blackboard object
 */
function isParentItem(item: unknown): item is ParentItem {
    return typeof item === "object"
        && item !== null
        && "hasChildren" in item
        && (item as { hasChildren: unknown }).hasChildren === true;
}

/**
 * Serializes a contents query to be sufficient for a queryString
 * @param {BaseContentsQuery} query query to serialize
 */
function mapContentsQuery<T extends BaseContentsQuery>({ recursive, reviewable, fields, ...query }: T): object {
    return {
        recursive: recursive === true ? 'true' : recursive === false ? 'false' : undefined,
        reviewable: reviewable === true ? 'true' : reviewable === false ? 'false' : undefined,
        fields: fields?.join(','),
        ...query
    }
}

interface BaseContentsQuery {
    offset?: number;
    limit?: number;
    recursive?: boolean;
    contentHandler?: string;
    created?: string;
    createdCompare?: "lessThan" | "greaterOrEqual";
    modified?: string;
    modifiedCompare?: "lessThan" | "greaterOrEqual";
    reviewable?: boolean;
    fields?: string[];
}

interface CourseContentsQuery extends BaseContentsQuery {
    courseID: string;
}

interface SubcontentsQuery extends CourseContentsQuery {
    contentID: string;
}

/**
 * API layer for interacting with course objects
 */
export class CourseLayer extends APILayer {
    private cache: {
        enrollments?: CourseEnrollment[];
        grades?: GradeMapping;
    } = {}

    /**
     * Returns all enrollments for the current user
     * @param cached whether to use cached results when possible. default true
     */
    async enrollments(cached = true): Promise<CourseEnrollment[]> {
        if (cached && this.cache.enrollments) return this.cache.enrollments;

        const { data: { results } } = await this.axios.get(`/users/${this.api.userID}/memberships?expand=course.effectiveAvailability,course.permissions,courseRole&includeCount=true&limit=10000`) as {
            data: MembershipEnrollmentListing;
        };

        this.cache.enrollments = results;

        return results;
    }

    /**
     * Fetches sidebar contents for a given course
     * @param {CourseContentsQuery} query query to apply when fetching the contents
     */
    private async fetchContents({ courseID, ...params }: CourseContentsQuery): Promise<CourseContentItem[]> {
        const { data: { results } } = await this.api.axios.get(this.api.formatURL(`/learn/api/public/v1/courses/${courseID}/contents`), {
            params: mapContentsQuery(params)
        });

        return results;
    }

    /**
     * Fetches the subcontents of a sidebar item
     * @param {CourseContentsQuery} query query to apply when fetching the subcontents
     */
    private async fetchSubcontents({ courseID, contentID, ...params }: SubcontentsQuery): Promise<CourseContentItem[]> {
        const { data: { results } } = await this.api.axios.get(this.api.formatURL(`/learn/api/public/v1/courses/${courseID}/contents/${contentID}/children`), {
            params: mapContentsQuery(params)
        });

        return results;
    }

    /**
     * Returns all sidebar contents for a given course
     * @param query query to apply when fetching the sidebar contents
     */
    async contents(query: CourseContentsQuery): Promise<CourseContentItem[]> {
        try {
            // Attempt to recursively list the contents of the course
            return await this.fetchContents({
                ...query,
                recursive: true
            });
        } catch (e) {
            if (isAxiosError(e) && e.response?.status === 403) {
                // Blackboard API doesn't have a good way to handle recursively
                // querying the sidebar contents when some items are not available.
                // As a result, we must manually retrieve subchildren if a recursive lookup fails.

                const topLevel = await this.fetchContents({
                    ...query,
                    recursive: false
                });

                const parents = topLevel.filter(item => isParentItem(item)) as unknown as ParentItem[];

                const subcontents = await Promise.all(parents.map(parent => {
                    if (parent.availability.available === "No") return [];
                    else return this.fetchSubcontents({
                        contentID: parent.id,
                        ...query
                    }).catch(() => [] as CourseContentItem[]);
                }));
                
                return subcontents.reduce((acc, c) => acc.concat(c), []).concat(topLevel);
            } else throw e;
        }
    }

    /**
     * Returns all courses we are or have been enrolled in
     * @param cached whether to use cached results. default true
     */
    async all(cached?: boolean): Promise<Course[]> {
        const enrollments = await this.enrollments(cached);

        return enrollments.map(({ course }) => course);
    }

    /**
     * Returns only courses we are currently enrolled in
     * @param cached whether to use cached results. default true
     */
    async activeCourses(cached?: boolean): Promise<Course[]> {
        const courses = await this.all(cached);

        const now = new Date();
        return courses.filter(course => new Date(course.endDate) > now && new Date(course.startDate) < now);
    }

    /**
     * Returns the contents of all courses we are either currently enrolled in or have ever been enrolled in.
     * 
     * This request can take up to a few seconds due to the recursion workaround.
     * Pending response from Blackboard developer relations.
     * @param activeCourses whether to only fetch for active courses. default is true
     * @param query query to apply to the sidebar lookup
     */
    async allContents(activeCourses = true, query: BaseContentsQuery = {}): Promise<Record<string, CourseContentItem[]>> {
        const courses = await (activeCourses ? this.activeCourses() : this.all());

        const contents = await Promise.all(courses.map(async course => {
            const contents = await this.contents({
                courseID: course.id,
                ...query
            });

            return [course.id, contents] as [string, CourseContentItem[]];
        }));

        return contents.reduce((acc, [id, contents]) => Object.assign(acc, {[id]: contents}), {} as Record<string, CourseContentItem[]>)
    }

    /**
     * Returns courses that have grades available for them
     */
    async courseIDsWithGrades(): Promise<string[]> {
        const { data: { coursesWithGrades } } = await this.axios.get("/telemetry/courses?filter=sufficientData") as {
            data: CourseListingResult
        };

        return coursesWithGrades;
    }
}