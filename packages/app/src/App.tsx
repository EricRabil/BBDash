import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import { useToasts } from "react-toast-notifications";
import { integrationAPI } from "./api";
import CourseContentsColumn from "./columns/CourseContentsColumn";
import GradesColumn from "./columns/GradesColumn";
import StreamColumn from "./columns/StreamColumn";
import ColumnGrid from "./components/ColumnGrid";
import { ColorCodingContext, loadCourseColorLedger, writeCourseColorLedger } from "./contexts/color-coding-context";
import usePersistentColumns from "./storage/column-items";

interface ColumnDefinition {
    icon: IconProp;
    component: React.FunctionComponentFactory<any>;
    id: string;
}

const columns: ColumnDefinition[] = [
    {
        icon: "align-left",
        component: StreamColumn,
        id: "stream"
    },
    {
        icon: "percent",
        component: GradesColumn,
        id: "grades"
    },
    {
        icon: "database",
        component: CourseContentsColumn,
        id: "contents"
    }
];

/**
 * Finds the definition of a column with the given identifier
 * @param id identifier of the column to lookup
 */
const findColumnByID: (id: string) => ColumnDefinition | null = id => columns.find(c => c.id === id) || null;

function App() {
    const [columnItems, setColumnItems, { addColumn, removeColumn, updatePreferences }] = usePersistentColumns();

    const [courseColorCoding, setCourseColorCoding] = useState(loadCourseColorLedger());

    const { addToast } = useToasts();

    const isShowingToast = useRef(false);

    const confirmRelogin = () => integrationAPI.auth.confirmRelogin();
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
            onDismiss: rejectRelogin
        }));
    });

    useEffect(() => {
        writeCourseColorLedger(courseColorCoding);
    }, [courseColorCoding]);
    
    const updateColorCodingForCourse = (courseID: string, value: string | null | false) => {
        const updated = Object.assign({}, courseColorCoding, {
            [courseID]: value
        });

        setCourseColorCoding(updated);
    };

    return (
        <div className="App">
            <div className="sidebar">
                {columns.map(({ icon, id }) => (
                    <FontAwesomeIcon icon={icon} key={id} onClick={() => addColumn(id)} title={id} />
                ))}
            </div>
            <ColorCodingContext.Provider value={{ courses: courseColorCoding, updateColorCodingForCourse }}>
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
            </ColorCodingContext.Provider>
        </div>
    );
}

export default App;
