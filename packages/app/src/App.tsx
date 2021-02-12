import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import GradesColumn from "./columns/GradesColumn";
import StreamColumn from "./columns/StreamColumn";
import ColumnGrid from "./components/ColumnGrid";
import "./scss/_index.scss";
import usePersistentColumns from "./storage/column-items";

function App() {
    const [columnItems, setColumnItems, { addColumn, removeColumn, updatePreferences }] = usePersistentColumns();

    function StreamAdder() {
        return <FontAwesomeIcon icon="align-left" onClick={() => addColumn("stream")} />;
    }

    function GradesAdder() {
        return <FontAwesomeIcon icon="percent" onClick={() => addColumn("grades")} />;
    }

    return (
        <div className="App">
            <div className="sidebar">
                <StreamAdder />
                <GradesAdder />
            </div>
            <ColumnGrid
                columnItems={columnItems}
                onLayoutChange={layout => {
                    const newColumnItems = columnItems.slice();

                    console.log({
                        layout,
                        newColumnItems
                    });

                    layout.forEach(entry => {
                        newColumnItems[+entry.i].column = entry.x;
                    });

                    setColumnItems(newColumnItems);
                }}
            >
                {columnItems.map((item, index) => {
                    let Element: React.FunctionComponentFactory<any>;

                    switch (item.id) {
                    case "grades":
                        Element = GradesColumn;
                        break;
                    case "stream":
                        Element = StreamColumn;
                        break;
                    default:
                        return <div key={index} data-grid={{ x: item.column, y: 0, w: 1, h: 1 }} />;
                    }

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
