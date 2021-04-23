import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import "react-contexify/dist/ReactContexify.css";
import "tippy.js/dist/tippy.css";
import BBTooltip from "./components/BBTooltip";
import ColumnGrid from "./components/ColumnGrid";
import FeedbackModal from "./components/modals/FeedbackModal";
import { useModal } from "./components/modals/Modal";
import SettingsModal from "./components/modals/SettingsModal";
import { ColorCodingContext } from "./contexts/color-coding-context";
import { useColorPaletteCSSVariables } from "./hooks/useColorPaletteCSSVariables";
import usePersistentColumns from "./hooks/usePersistentColumns";
import useReloginWatcher from "./hooks/useReloginWatcher";
import { COLUMN_DEFINITIONS } from "./utils/column-definitions";

export default function App() {
    const [,, { addColumn }] = usePersistentColumns();

    const [ isSettingsShowing, toggleIsSettingsShowing ] = useModal();
    const [ isFeedbackShowing, toggleIsFeedbackShowing ] = useModal();

    useReloginWatcher();

    const colorPaletteCSSVariables = useColorPaletteCSSVariables();

    return (
        <ColorCodingContext.Consumer>
            {({ background }) => (
                <>
                    <div className="App" style={{
                        backgroundColor: background,
                        ...colorPaletteCSSVariables
                    }}>
                        <div className="sidebar">
                            {COLUMN_DEFINITIONS.map(({ icon, dataSource, name }) => (
                                <BBTooltip key={dataSource} placement="right" content={<span>{name}</span>}>
                                    <span className="sidebar-icon-container"><FontAwesomeIcon icon={icon} onClick={() => addColumn(dataSource)} /></span>
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
