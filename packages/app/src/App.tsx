import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useCallback, useContext } from "react";
import "react-contexify/dist/ReactContexify.css";
import "tippy.js/dist/tippy.css";
import BBTooltip from "./components/BBTooltip";
import ColumnGrid from "./components/ColumnGrid";
import FeedbackModal from "./components/modals/FeedbackModal";
import SettingsModal from "./components/modals/SettingsModal";
import { ColorCodingContext } from "./contexts/color-coding-context";
import { ModalContextProvider } from "./contexts/modal-context";
import { useColorPaletteCSSVariables } from "./hooks/useColorPaletteCSSVariables";
import usePersistentColumns from "./hooks/usePersistentColumns";
import useReloginWatcher from "./hooks/useReloginWatcher";
import { COLUMN_DEFINITIONS } from "./utils/column-definitions";

function SidebarItem({ ariaHidden = false, tooltip, popsUp = false, icon, click }: { ariaHidden?: boolean, tooltip: string, popsUp?: boolean, icon: IconProp, click?: () => void }) {
    return (
        <BBTooltip placement="right" content={<span>{tooltip}</span>}>
            <li role="menuitem" aria-haspopup={popsUp} aria-hidden={ariaHidden} aria-label={tooltip} className="sidebar-icon-container" onClick={click}><FontAwesomeIcon icon={icon} /></li>
        </BBTooltip>
    );
}

export default function App() {
    const [,, { addColumn }] = usePersistentColumns();

    const { colorPaletteID, setColorPaletteID } = useContext(ColorCodingContext);

    const isDark = colorPaletteID === "dark";

    const toggleTheme = useCallback(() => {
        setColorPaletteID(isDark ? "light" : "dark");
    }, [colorPaletteID, isDark, setColorPaletteID]);

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
                        <nav className="sidebar" role="navigation">
                            <ul role="menubar" className="sidebar-section" aria-label="Column Creators">
                                {COLUMN_DEFINITIONS.map(({ icon, dataSource, name }) => (
                                    <SidebarItem key={dataSource} tooltip={`Add ${name} Column`} icon={icon} click={() => addColumn(dataSource)} />
                                ))}
                            </ul>
                            <div className="sidebar-spacer" aria-hidden />
                            <ul role="menubar" className="sidebar-section" aria-label="App Controls">
                                <SidebarItem ariaHidden tooltip={isDark ? "Light Mode" : "Dark Mode"} icon={isDark ? "sun" : "moon"} click={toggleTheme} />
                                <ModalContextProvider>
                                    {({ toggleShowing }) => (
                                        <>
                                            <SidebarItem popsUp tooltip="Report Bug" icon="exclamation-triangle" click={toggleShowing} />
                                            <FeedbackModal />
                                        </>
                                    )}
                                </ModalContextProvider>
                                <ModalContextProvider>
                                    {({ toggleShowing }) => (
                                        <>
                                            <SidebarItem popsUp tooltip="Settings" icon="cog" click={toggleShowing} />
                                            <SettingsModal />
                                        </>
                                    )}
                                </ModalContextProvider>
                            </ul>
                        </nav>
                        <ColumnGrid />
                    </div>
                </>
            )}
        </ColorCodingContext.Consumer>
    );
}
