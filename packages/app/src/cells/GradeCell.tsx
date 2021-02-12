import { Course, GradebookEntry, GradebookStatus } from "@bbdash/shared";
import React from "react";
import ColumnCell from "../components/ColumnCell";

function num(numbers: (number | null | undefined)[], fallback: number): number {
    const existing = numbers.find(num => typeof num === "number");
    if (typeof existing === "number") return existing;
    else return fallback;
}

const pointsEarned = (entry: GradebookEntry) => typeof entry.manualGrade === "number" ? entry.manualGrade : typeof entry.displayGrade?.score === "number" ? entry.displayGrade.score : null;

export default class GradeCell extends React.Component<{
    course: Course;
    grades: GradebookEntry[];
    hideIfNA: boolean;
}> {
    gradebookURL() {
        const url = new URL(this.props.course.externalAccessUrl);

        url.searchParams.set("legacyUrl", `/webapps/gradebook/do/student/viewGrades?course_id=${this.props.course.id}`);

        return url.toString();
    }

    grade() {
        const { actual, possible } = this.props.grades.filter(g => g.status === GradebookStatus.GRADED).reduce(({ actual, possible }, grade) => {
            const earned = pointsEarned(grade);

            return {
                actual: actual + (earned || 0),
                possible: possible + (typeof earned === "number" ? grade.pointsPossible : 0)
            };
        }, { actual: 0, possible: 0 });

        const percentage = (actual / possible) * 100;

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