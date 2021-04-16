import React, { useContext } from "react";
import { ColorCodingContext, ColorPalettes } from "../../contexts/color-coding-context";
import { CourseBlacklistContext } from "../../contexts/course-blacklist-context";
import { useAllActiveCourses } from "../../hooks/useAllActiveCourses";
import { GIT_HASH } from "../../utils/git";
import { SettingsListField } from "../SettingsField";
import BBModal, { BBModalContentContext } from "./BBModal";

export default function SettingsModal(props: Omit<BBModalContentContext, "children">) {
    const allCourses = useAllActiveCourses();

    const { colorPaletteID, colorPaletteIDs, setColorPaletteID } = useContext(ColorCodingContext);

    return (
        <BBModal {...props} header={
            <>
                <span>Settings</span>
                <span className="dash-version">BBDash {GIT_HASH}</span>
            </>
        } className="dash-settings">
            <CourseBlacklistContext.Consumer>
                {({ blacklistedCourses, overwriteBlacklistedCourses }) => (
                    <SettingsListField multi={true} options={Object.keys(allCourses)} value={blacklistedCourses} setValue={newValue => {
                        overwriteBlacklistedCourses(newValue);
                    }} header={
                        <span>Hidden Courses</span>
                    }>
                        {id => (
                            <>
                                {allCourses[id]?.displayName || allCourses[id]?.name || id}
                            </>
                        )}
                    </SettingsListField>
                )}
            </CourseBlacklistContext.Consumer>
            
            <SettingsListField multi={false} options={colorPaletteIDs} value={colorPaletteID} setValue={newValue => {
                setColorPaletteID(newValue);
            }} header={<>Color Palette</>}>
                {paletteID => (
                    <div className="palette-tray">
                        <span className="palette-name">{paletteID}</span>
                        <div className="palette-colors">
                            {ColorPalettes[paletteID].colors.map(color => (
                                <span className="palette-color" style={{
                                    backgroundColor: color
                                }} key={color} />
                            ))}
                        </div>
                    </div>
                )}
            </SettingsListField>
        </BBModal>
    );
}