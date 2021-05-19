import FeedbackModal from "@components/modals/FeedbackModal";
import SettingsModal from "@components/modals/SettingsModal";
import SidebarItem from "@components/sidebar/SidebarItem";
import { ColorCodingContext } from "@contexts/color-coding-context";
import { ModalContextProvider } from "@contexts/modal-context";
import usePersistentColumns from "@hooks/usePersistentColumns";
import useSyncInsights from "@hooks/useSyncInsights";
import { reloadAll } from "@store/connection";
import { COLUMN_DEFINITIONS } from "@utils/column-definitions";
import React, { useCallback, useContext } from "react";

export default function Sidebar() {
    const { colorPaletteID, setColorPaletteID } = useContext(ColorCodingContext);
    const [, , { addColumn }] = usePersistentColumns();

    const isDark = colorPaletteID === "dark";

    const toggleTheme = useCallback(() => {
        setColorPaletteID(isDark ? "light" : "dark");
    }, [colorPaletteID, isDark, setColorPaletteID]);

    const { anySyncing, allSyncing } = useSyncInsights();

    return (
        <nav className="sidebar" role="navigation">
            <ul role="menubar" className="sidebar-section" aria-label="Column Creators">
                {COLUMN_DEFINITIONS.map(({ icon, dataSource, name }) => (
                    <SidebarItem key={dataSource} tooltip={`Add ${name} Column`} icon={icon} click={() => addColumn(dataSource)} />
                ))}
            </ul>
            <div className="sidebar-spacer" aria-hidden />
            <ul role="menubar" className="sidebar-section" aria-label="App Controls">
                <SidebarItem ariaHidden tooltip={isDark ? "Light Mode" : "Dark Mode"} icon={isDark ? "sun" : "moon"} click={toggleTheme} />
                <SidebarItem disabled={allSyncing} click={reloadAll} tooltip={
                    anySyncing ? "Syncing" : "Sync All"
                } icon="sync" spin={anySyncing} />
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
    );
}