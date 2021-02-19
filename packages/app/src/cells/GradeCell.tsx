import { Course, GradebookEntry, GradebookStatus } from "@bbdash/shared";
import React from "react";
import ColumnCell from "../components/ColumnCell";

const pointsEarned = (entry: GradebookEntry) => typeof entry.manualGrade === "number" ? entry.manualGrade : typeof entry.displayGrade?.score === "number" ? entry.displayGrade.score : null;

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
        const { actual, possible } = this.props.grades.filter(g => g.status === GradebookStatus.GRADED).reduce(({ actual, possible }, grade) => {
            const earned = pointsEarned(grade);

            return {
                actual: actual + (earned || 0),
                possible: possible + (typeof earned === "number" ? grade.pointsPossible : 0)
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

        return <ColumnCell className="data-cell">
            <div className="data-cell--inner">
                <div className="data-cell--header">
                    <a href={this.gradebookURL()} className="data-cell--header-title" target="_blank" rel="noreferrer">{this.props.course.displayName}</a>
                </div>
                <div className="data-cell--description">{grade}</div>
            </div>
        </ColumnCell>;
    }
}