import { Course, CourseContentItem, CourseEnrollment, GradeMapping, PaginatedQuery } from "@bbdash/shared";
import APILayer from "../structs/layer";
import { isAxiosError, SharedThrottle } from "../util";

interface CourseListingResult {
    coursesWithActivity: string[];
    coursesWithGrades: string[];
}

type MembershipEnrollmentListing = PaginatedQuery<CourseEnrollment>;

interface ParentItem extends CourseContentItem {
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

type Cachable<T extends object> = T & {
    cache?: boolean;
}

/**
 * API layer for interacting with course objects
 */
export class CourseLayer extends APILayer {
    private cache: {
        enrollments?: CourseEnrollment[];
        grades?: GradeMapping;
        contents: Record<string, CourseContentItem[]>;
    } = {
        contents: {}
    }
    
    private throttle = new SharedThrottle(2);

    private pendingEnrollments: Promise<CourseEnrollment[]> | null = null;
    /**
     * Returns all enrollments for the current user
     * @param cached whether to use cached results when possible. default true
     */
    async enrollments(cached = true): Promise<CourseEnrollment[]> {
        if (cached && this.cache.enrollments) return this.cache.enrollments;
        if (this.pendingEnrollments) return this.pendingEnrollments;

        const results = await (this.pendingEnrollments = new Promise(async resolve => {
            const { data: { results } } = await this.axios.get(`/users/${this.api.userID}/memberships?expand=course.effectiveAvailability,course.permissions,courseRole&includeCount=true&limit=10000`) as {
                data: MembershipEnrollmentListing;
            };
    
            this.cache.enrollments = results;
            resolve(results);
            this.pendingEnrollments = null;
        }));

        return results;
    }

    /**
     * Fetches sidebar contents for a given course
     * @param {CourseContentsQuery} query query to apply when fetching the contents
     */
    private async fetchContents({ courseID, ...params }: CourseContentsQuery): Promise<CourseContentItem[]> {
        const { data: { results } } = await this.throttle.processOne(() => this.api.axios.get(this.api.formatURL(`/learn/api/public/v1/courses/${courseID}/contents`), {
            params: mapContentsQuery(params)
        }));

        return results;
    }

    /**
     * Fetches the subcontents of a sidebar item
     * @param {CourseContentsQuery} query query to apply when fetching the subcontents
     */
    private async fetchSubcontents({ courseID, contentID, ...params }: SubcontentsQuery): Promise<CourseContentItem[]> {
        const { data: { results } } = await this.throttle.processOne(() => this.api.axios.get(this.api.formatURL(`/learn/api/public/v1/courses/${courseID}/contents/${contentID}/children`), {
            params: mapContentsQuery(params)
        }));

        return results;
    }

    /**
     * Returns all sidebar contents for a given course
     * @param query query to apply when fetching the sidebar contents
     */
    async contents(query: Cachable<CourseContentsQuery>, stripStyles = true): Promise<CourseContentItem[]> {
        if (query.cache && this.cache.contents[query.courseID]) return this.cache.contents[query.courseID];
        
        const result = await (async () => {
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
    
                    let parents = topLevel.filter(item => isParentItem(item)) as unknown as ParentItem[];
                    parents = parents.filter(parent => parent.availability.available !== "No");
                    
                    const subcontents = await this.batch<{ results: CourseContentItem[] }, ParentItem>(parents, parent => `v1/courses/${query.courseID}/contents/${parent.id}/children`);

                    return subcontents.reduce((acc, c) => acc.concat(c.body.results), [] as CourseContentItem[]).concat(topLevel);
                } else throw e;
            }
        })();

        if (stripStyles) result.forEach(r => r.body = r.body?.replace?.(/\s?(width|float|clear|height|font-size|(margin|padding)(-(top|left|bottom|right))?):\s?[\d|\w|%|.]+;?/g, ""));

        return this.cache.contents[query.courseID] = result;
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
        return courses.filter(course => new Date(course.term?.endDate || course.endDate) > now && new Date(course.term?.startDate || course.startDate) < now);
    }

    /**
     * Returns the contents of all courses we are either currently enrolled in or have ever been enrolled in.
     * 
     * This request can take up to a few seconds due to the recursion workaround.
     * Pending response from Blackboard developer relations.
     * @param activeCourses whether to only fetch for active courses. default is true
     * @param query query to apply to the sidebar lookup
     */
    async allContents(activeCourses = true, query: Cachable<BaseContentsQuery> = {}): Promise<Record<string, CourseContentItem[]>> {
        const courses = await (activeCourses ? this.activeCourses() : this.all());

        const results: Record<string, CourseContentItem[]> = courses.reduce((acc, course) => {
            acc[course.id] = [];
            return acc;
        }, {} as Record<string, CourseContentItem[]>);

        const contents = await this.batch<PaginatedQuery<CourseContentItem>, Course>(courses, course => `v1/courses/${course.id}/contents?recursive=true`);

        const needsRecurse: Course[] = [];

        for (const [ index, result ] of contents.entries()) {
            if (result.statusCode === 200 && result.body.results.length) {
                results[result.body.results[0].courseId].push(...result.body.results);
            } else if (result.statusCode === 403) {
                needsRecurse.push(courses[index]);
            }
        }

        const shallowContents = await this.batch<PaginatedQuery<CourseContentItem>, Course>(needsRecurse, course => `v1/courses/${course.id}/contents`);

        const processItems = async (items: CourseContentItem[]) => {
            const needsMore: ParentItem[] = [];

            for (const item of items) {
                results[item.courseId].push(item);
                if (isParentItem(item) && item.availability.available !== "No") {
                    needsMore.push(item);
                }
            }

            if (needsMore.length) {
                const children = await this.batch<PaginatedQuery<CourseContentItem>, ParentItem>(needsMore, parent => `v1/courses/${parent.courseId}/contents/${parent.id}/children`);

                await processItems(children.reduce((acc, c) => acc.concat(c.body.results), [] as CourseContentItem[]));
            }
        }

        await processItems(shallowContents.reduce((acc, c) => acc.concat(c.body.results), [] as CourseContentItem[]));

        return results;
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