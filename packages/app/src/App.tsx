import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useMemo } from "react";
import "react-contexify/dist/ReactContexify.css";
import "tippy.js/dist/tippy.css";
import BBTooltip from "./components/BBTooltip";
import ColumnGrid, { COLUMN_DEFINITIONS } from "./components/ColumnGrid";
import FeedbackModal from "./components/modals/FeedbackModal";
import { useModal } from "./components/modals/Modal";
import SettingsModal from "./components/modals/SettingsModal";
import { ColorCodingContext } from "./contexts/color-coding-context";
import usePersistentColumns from "./hooks/usePersistentColumns";
import useReloginWatcher from "./hooks/useReloginWatcher";

function useDynamicCourseStyles(): Record<string, string> {
    const { courseColors, courseTextColors } = useContext(ColorCodingContext);

    return useMemo(() => {
        const courseColorVariables: [string, string][] = Object.entries(courseColors).map(([ courseID, courseColor ]) => [`--course-background-${courseID}`, courseColor]);
        const courseTextVariables: [string, string][] = Object.entries(courseTextColors).map(([ courseID, courseTextColor ]) => [`--course-text-color-${courseID}`, courseTextColor]);

        return Object.fromEntries(courseColorVariables.concat(courseTextVariables));
    }, [courseColors, courseTextColors]);
}

export default function App() {
    const [,, { addColumn }] = usePersistentColumns();

    const [ isSettingsShowing, toggleIsSettingsShowing ] = useModal();
    const [ isFeedbackShowing, toggleIsFeedbackShowing ] = useModal();

    useReloginWatcher();

    const dynamicCourseStyles = useDynamicCourseStyles();

    return (
        <ColorCodingContext.Consumer>
            {({ background }) => (
                <>
                    <div className="App" style={{
                        backgroundColor: background,
                        ...dynamicCourseStyles
                    }}>
                        <div className="sidebar">
                            {COLUMN_DEFINITIONS.map(({ icon, id, name }) => (
                                <BBTooltip key={id} placement="right" content={<span>{name}</span>}>
                                    <span className="sidebar-icon-container"><FontAwesomeIcon icon={icon} onClick={() => addColumn(id)} /></span>
                                </BBTooltip>
                            ))}
                            <div className="sidebar-spacer" />
                            <BBTooltip placement="right" content={<span>Report Bug</span>}>
                                <span className="sidebar-icon-container" onClick={toggleIsFeedbackShowing}><FontAwesomeIcon icon="exclamation-triangle" /></span>
                            </BBTooltip>
                            <BBTooltip placement="right" content={<span>Settings</span>}>
                                <span className="sidebar-icon-container" onClick={toggleIsSettingsShowing}><FontAwesomeIcon icon="cog" /></span>
                            </BBTooltip>
                        </div>
                        <SettingsModal isShowing={isSettingsShowing} toggleShowing={toggleIsSettingsShowing} />
                        <FeedbackModal isShowing={isFeedbackShowing} toggleShowing={toggleIsFeedbackShowing} />
                        <ColumnGrid />
                    </div>
                </>
            )}
        </ColorCodingContext.Consumer>
    );
}
