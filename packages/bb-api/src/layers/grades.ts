import { Course, GradebookEntry, GradeMapping, PaginatedQuery } from "@bbdash/shared";
import APILayer from "../structs/layer";
import { SharedThrottle } from "../util";

type GradeListing = PaginatedQuery<GradebookEntry>;

/**
 * API layer for interacting with the gradebook
 */
export class GradesLayer extends APILayer {
    private cache: {
        grades: Record<string, GradebookEntry[]>
    } = {
        grades: {}
    }

    /**
     * Returns grades for a course with the given ID
     * @param courseID course to get grades for
     * @param cached whether to use cached results. default false
     */
    async forCourse(courseID: string, cached = false): Promise<GradebookEntry[]> {
        if (cached && this.cache.grades && this.cache.grades[courseID]) return this.cache.grades[courseID];

        const { data: { results } } = await SharedThrottle.sharedInstance.processOne(() => this.axios.get(`/courses/${courseID}/gradebook/grades?isExcludedFromCourseUserActivity=true&limit=100&userId=${this.api.userID}`)) as {
            data: GradeListing
        };

        (this.cache.grades || (this.cache.grades = {}))[courseID] = results;

        return results;
    }

    /**
     * Returns grades for all courses, either currently or ever enrolled
     * @param currentOnly whether to get grades only for currently enrolled courses. default true
     * @param cached whether to use cached results. default false
     */
    async all(currentOnly = true, cached?: boolean): Promise<GradeMapping> {
        const courses = await (currentOnly ? this.api.courses.activeCourses(cached) : this.api.courses.all(cached))

        const gradeMapping: GradeMapping = {};

        const gradeResults = await this.batch<GradeListing, Course>(courses, course => `v1/courses/${course.id}/gradebook/grades?isExcludedFromCourseUserActivity=true&limit=100&userId=${this.api.userID}`)

        for (const { body: { results } } of gradeResults) {
            if (!results.length) continue;
            const [ { courseId } ] = results;
            gradeMapping[courseId] = results;
        }

        return gradeMapping;
    }
}
