import React from "react";
import GradeCell from "../cells/GradeCell";
import Column, { BasePreferences, ColumnOptions } from "../components/Column";
import ColumnSettingsField from "../components/ColumnSettingsField";
import useCourses from "../composables/useCourses";
import { useDefaultPreferences } from "../composables/useDefaultPreferences";
import useGrades from "../composables/useGrades";

export interface GradesPreferences extends BasePreferences {
    hideNACourses: boolean;
}

const defaults: GradesPreferences = {
    hideNACourses: false,
    name: "Grades"
};

/**
 * Lays out grade cells. Pulls grade data from BBAPI
 * @param props column options
 */
export default function GradesColumn(props: ColumnOptions<GradesPreferences>) {
    const courses = useCourses();
    const grades = useGrades();

    useDefaultPreferences(props, defaults);

    return <Column header={<div>Grades</div>} settings={(
        <React.Fragment>
            <ColumnSettingsField type="checkbox" labelText={(
                <React.Fragment>Hide courses with no grade</React.Fragment>
            )} prefKey="hideNACourses" {...props} />
        </React.Fragment>
    )} {...props}>
        {Object.entries(grades).map(([ courseID, grades ]) => (
            <GradeCell key={courseID} course={courses[courseID]} grades={grades} hideIfNA={props.preferences.hideNACourses}></GradeCell>
        ))}
    </Column>;
}