import { Course, GradebookEntry } from "@bbdash/shared";
import React from "react";
import ColumnCell from "../components/ColumnCell";

function convertDisplayGrade(entry: GradebookEntry): number | null {
    if (!entry.displayGrade) return null;
    return (+entry.displayGrade / 100) * entry.pointsPossible;
}

/**
 * Presents one unit of grade data
 */
export default class GradeCell extends React.Component<{
    course: Course;
    grades: GradebookEntry[];
    hideIfNA: boolean;
}> {
    /**
     * Computes an absolute URL pointing to the gradebook for the given entry
     */
    gradebookURL() {
        const url = new URL(this.props.course.externalAccessUrl);

        url.searchParams.set("legacyUrl", `/webapps/gradebook/do/student/viewGrades?course_id=${this.props.course.id}`);

        return url.toString();
    }

    /**
     * Computes the grade in the current course
     */
    grade() {
        const gradePairs = this.props.grades.filter(m => m.status === "GRADED" || typeof m.manualGrade === "string").map(m => [parseFloat(([m.manualGrade || m.manualScore || convertDisplayGrade(m)] as unknown as string[]).find(g => typeof g !== "undefined" && g !== null) || ""), m.pointsPossible]).filter(([pts,pos]) => !isNaN(pts) && !isNaN(pos));

        const { actual, possible } = gradePairs.reduce(({ actual, possible }, [ earned, pointsPossible ]) => {
            return {
                actual: actual + earned,
                possible: possible + (typeof earned === "number" ? pointsPossible : 0)
            };
        }, { actual: 0, possible: 0 });

        const percentage = (actual / possible) * 100;

        // Prettify NaN. Return null if the user doesn't want to see N/A entries
        if (isNaN(percentage)) return this.props.hideIfNA ? null : "N/A";
        else return `${percentage.toFixed(2)}%`;
    }

    render() {
        const grade = this.grade();

        if (grade === null) return null;

        return <ColumnCell className="data-cell" course={this.props.course}>
            <div className="data-cell--inner">
                <div className="data-cell--header">
                    <a href={this.gradebookURL()} className="data-cell--header-title" target="_blank" rel="noreferrer">{this.props.course.displayName}</a>
                </div>
                <div className="data-cell--description">{grade}</div>
            </div>
        </ColumnCell>;
    }
}