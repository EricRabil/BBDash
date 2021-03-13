import React, { useContext } from "react";
import { useAllActiveCourses } from "../../composables/useCourses";
import { CourseFilterContext } from "../../contexts/course-filter-context";
import { GIT_HASH } from "../../utils/git";
import BBModal, { BBModalContentContext } from "../BBModal";
import { BasePreferences } from "../Column";
import { ColumnSettingsFieldOptions, ColumnSettingsListField } from "../ColumnSettingsField";

interface SettingsPreferences extends BasePreferences {
    hiddenCourses: Record<string, boolean>;
}

interface IsolatedPreferences<T> extends BasePreferences {
    isolatedValue: T;
}

interface IsolatedSettingsContext<T> extends Omit<ColumnSettingsFieldOptions<IsolatedPreferences<T>>, "type" | "labelText" | "prefKey"> {
    prefKey: keyof IsolatedPreferences<T>;
}

function useIsolatedSettingsContext<T>(value: T, updated: (newValue: T) => void): IsolatedSettingsContext<T> {
    const preferences: IsolatedPreferences<T> = {
        isolatedValue: value,
        name: ""
    };
    
    return {
        prefKey: "isolatedValue",
        preferences,
        updatePreferences: prefs => updated(prefs.isolatedValue),
        onUpdate: newValue => updated(newValue as T),
        remove: () => undefined,
        value
    };
}

export default function SettingsModal(props: Omit<BBModalContentContext, "children">) {
    const allCourses = useAllActiveCourses();

    const { overwriteFilter, courseFilter } = useContext(CourseFilterContext);

    console.log(courseFilter);
    
    const settingsContext = useIsolatedSettingsContext(courseFilter, overwriteFilter);

    return (
        <BBModal {...props} header={
            <span>Settings</span>
        }>
            <ColumnSettingsListField type="list" multi={true} values={Object.keys(allCourses)} labelText={id => (
                <React.Fragment>
                    {allCourses[id]?.displayName || allCourses[id]?.name || id}
                </React.Fragment>
            )} header={<React.Fragment>Hidden Courses</React.Fragment>} {...settingsContext} />
            <span>BBDash {GIT_HASH}</span>
        </BBModal>
    );
}