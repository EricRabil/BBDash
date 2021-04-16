import { GradebookEntry, GradeMapping, PaginatedQuery } from "@bbdash/shared";
import APILayer from "../structs/layer";

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

        const { data: { results } } = await this.axios.get(`/courses/${courseID}/gradebook/grades?isExcludedFromCourseUserActivity=true&limit=100&userId=${this.api.userID}`) as {
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

        await Promise.all(courses.map(async course => {
            try {
                gradeMapping[course.id] = await this.forCourse(course.id, cached);
            } catch (e) {
                gradeMapping[course.id] = [];
            }
        }))

        return gradeMapping;
    }
}
