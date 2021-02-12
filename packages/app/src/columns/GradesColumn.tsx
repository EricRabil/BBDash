import React from "react";
// import { useSelector } from "react-redux";
// import { getCourses } from "../app/slices/courses";
// import { getGrades } from "../app/slices/grades";
import GradeCell from "../cells/GradeCell";
import Column, { BasePreferences, ColumnOptions } from "../components/Column";
import ColumnSettingsField from "../components/ColumnSettingsField";
import useCourses from "../composables/useCourses";
import { useDefaultPreferences, useMergePreferences } from "../composables/useDefaultPreferences";
import useGrades from "../composables/useGrades";

export interface GradesPreferences extends BasePreferences {
    hideNACourses: boolean;
}

const defaults: GradesPreferences = {
    hideNACourses: false,
    name: "Grades"
};

export default function GradesColumn(props: ColumnOptions<GradesPreferences>) {
    const courses = useCourses();
    const grades = useGrades();

    useDefaultPreferences(props, defaults);
    const merge = useMergePreferences(props);

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