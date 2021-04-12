import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect, useRef } from "react";
import { useToasts } from "react-toast-notifications";
import "tippy.js/dist/tippy.css";
import { integrationAPI } from "./api";
import CourseContentsColumn from "./columns/CourseContentsColumn";
import GradesColumn from "./columns/GradesColumn";
import StreamColumn from "./columns/StreamColumn";
import BBTooltip from "./components/BBTooltip";
import ColumnGrid from "./components/ColumnGrid";
import { useModal } from "./components/Modal";
import FeedbackModal from "./components/modals/FeedbackModal";
import SettingsModal from "./components/modals/SettingsModal";
import { ColorCodingContext } from "./contexts/color-coding-context";
import usePersistentColumns from "./storage/column-items";

interface ColumnDefinition {
    icon: IconProp;
    component: React.FunctionComponentFactory<any>;
    id: string;
    name: string;
}

const columns: ColumnDefinition[] = [
    {
        icon: "align-left",
        component: StreamColumn,
        id: "stream",
        name: "Activity Stream"
    },
    {
        icon: "percent",
        component: GradesColumn,
        id: "grades",
        name: "Grades"
    },
    {
        icon: "database",
        component: CourseContentsColumn,
        id: "contents",
        name: "Course Contents"
    }
];

/**
 * Finds the definition of a column with the given identifier
 * @param id identifier of the column to lookup
 */
const findColumnByID: (id: string) => ColumnDefinition | null = id => columns.find(c => c.id === id) || null;

function App() {
    const [columnItems, setColumnItems, { addColumn, removeColumn, updatePreferences }] = usePersistentColumns();

    const { addToast, removeToast } = useToasts();

    const [ isSettingsShowing, toggleIsSettingsShowing ] = useModal();
    const [ isFeedbackShowing, toggleIsFeedbackShowing ] = useModal();

    const isShowingToast = useRef(false);

    const confirmRelogin = async () => {
        await integrationAPI.auth.confirmRelogin();
        isShowingToast.current = false;
        removeToast("relogin-prompt");
    };
    const rejectRelogin = async () => {
        await integrationAPI.auth.rejectRelogin();
        isShowingToast.current = false;
    };

    useEffect(() => {
        integrationAPI.auth.onIsLoggedOut(() => !isShowingToast.current && (isShowingToast.current = true) && addToast((
            <div onClick={confirmRelogin}>You&apos;re logged out. Click here to log back in.</div>
        ), {
            appearance: "warning",
            autoDismiss: false,
            onDismiss: rejectRelogin,
            id: "relogin-prompt"
        }));
    });

    const { background } = useContext(ColorCodingContext);

    return (
        <div className="App" style={{
            backgroundColor: background
        }}>
            <div className="sidebar">
                {columns.map(({ icon, id, name }) => (
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
            <ColumnGrid
                columnItems={columnItems}
                onLayoutChange={layout => {
                    const newColumnItems = columnItems.slice();

                    layout.forEach(entry => {
                        newColumnItems[+entry.i].column = entry.x;
                    });

                    setColumnItems(newColumnItems);
                }}
            >
                {columnItems.map((item, index) => {
                    const Element = findColumnByID(item.id)?.component;

                    if (!Element) return <div key={index} data-grid={{ x: item.column, y: 0, w: 1, h: 1 }} />;

                    return <Element
                        key={index}
                        data-grid={{ x: item.column, y: 0, w: 1, h: 1 }}
                        id={index}
                        preferences={item.preferences}
                        updatePreferences={(preferences: object) => updatePreferences(index, preferences)}
                        remove={() => removeColumn(index)} />;
                })}
            </ColumnGrid>
        </div>
    );
}

export default App;
