import React, { useContext } from "react";
import { useAllActiveCourses } from "../../composables/useCourses";
import { ColorCodingContext } from "../../contexts/color-coding-context";
import { CourseFilterContext } from "../../contexts/course-filter-context";
import { GIT_HASH } from "../../utils/git";
import BBModal, { BBModalContentContext } from "../BBModal";
import { ColumnSettingsListField as ColumnSettingsListField2 } from "../ColumnSettingsField2";

export default function SettingsModal(props: Omit<BBModalContentContext, "children">) {
    const allCourses = useAllActiveCourses();

    const { overwriteFilter, courseFilter } = useContext(CourseFilterContext);
    
    const { colorPaletteID, colorPaletteIDs, setColorPaletteID } = useContext(ColorCodingContext);

    return (
        <BBModal {...props} header={
            <React.Fragment>
                <span>Settings</span>
                <span className="dash-version">BBDash {GIT_HASH}</span>
            </React.Fragment>
        } className="dash-settings">
            <ColumnSettingsListField2 multi={true} options={Object.keys(allCourses)} value={courseFilter} setValue={newValue => {
                overwriteFilter(newValue);
            }} header={
                <>
                    <span>Hidden Courses</span>
                </>
            }>
                {id => (
                    <>
                        {allCourses[id]?.displayName || allCourses[id]?.name || id}
                    </>
                )}
            </ColumnSettingsListField2>
            
            <ColumnSettingsListField2 multi={false} options={colorPaletteIDs} value={colorPaletteID} setValue={newValue => {
                setColorPaletteID(newValue);
            }} header={<>Color Palette</>}>
                {option => (
                    <>{option}</>
                )}
            </ColumnSettingsListField2>
        </BBModal>
    );
}