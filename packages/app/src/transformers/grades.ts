import { GradebookEntry } from "@bbdash/shared";
import { TransformationOptions } from ".";
import { courseLink } from "../utils/courses";
import { BBURI } from "../utils/uri";
import { TaggedGradebookEntries } from "./data-source-spec";
import { DataCellData, ENTRY_EMPTY, RenderContentFormat } from "./spec";

function convertDisplayGrade(entry: GradebookEntry): number | null {
    if (!entry.displayGrade) return null;
    return (+entry.displayGrade / 100) * entry.pointsPossible;
}

const NO_GRADE = "N/A";

function calculateAverage(grades: GradebookEntry[]): string {
    const gradePairs = grades.filter(m => m.status === "GRADED" || typeof m.manualGrade === "string").map(m => [parseFloat(([m.manualGrade || m.manualScore || convertDisplayGrade(m)] as unknown as string[]).find(g => typeof g !== "undefined" && g !== null) || ""), m.pointsPossible]).filter(([pts,pos]) => !isNaN(pts) && !isNaN(pos));

    const { actual, possible } = gradePairs.reduce(({ actual, possible }, [ earned, pointsPossible ]) => {
        return {
            actual: actual + earned,
            possible: possible + (typeof earned === "number" ? pointsPossible : 0)
        };
    }, { actual: 0, possible: 0 });

    const percentage = (actual / possible) * 100;

    // Prettify NaN. Return null if the user doesn't want to see N/A entries
    if (isNaN(percentage)) return NO_GRADE;
    else return `${percentage.toFixed(2)}%`;
}

export default function transformGradeEntries(courseGrades: TaggedGradebookEntries[], { courses }: TransformationOptions): DataCellData[] {
    const data: DataCellData[] = [];

    for (const { courseID, grades } of courseGrades) {
        const course = courses[courseID];
        const localizedAverage = calculateAverage(grades);
        const link = courseLink(course, `/webapps/gradebook/do/student/viewGrades?course_id=${courseID}`);

        data.push({
            header: {
                title: {
                    format: RenderContentFormat.text,
                    data: course.displayName,
                    link
                }
            },
            description: localizedAverage,
            attributes: {
                courseID,
                uri: BBURI.fromGradebook({ courseID, grades }).toString()
            },
            filterables: {
                [ENTRY_EMPTY]: localizedAverage === NO_GRADE
            }
        });
    }

    return data;
}