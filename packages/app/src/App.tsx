import React from "react";
import "react-contexify/dist/ReactContexify.css";
import "tippy.js/dist/tippy.css";
import ColumnGrid from "./components/ColumnGrid";
import Sidebar from "./components/Sidebar";
import { ColorCodingContext } from "./contexts/color-coding-context";
import { useColorPaletteCSSVariables } from "./hooks/useColorPaletteCSSVariables";
import useDataCaching from "@hooks/useDataCaching";

export default function App() {
    const colorPaletteCSSVariables = useColorPaletteCSSVariables();
    useDataCaching();

    return (
        <ColorCodingContext.Consumer>
            {({ background }) => (
                <>
                    <div className="App" style={{
                        backgroundColor: background,
                        ...colorPaletteCSSVariables
                    }}>
                        <ColumnGrid />
                        <Sidebar />
                    </div>
                </>
            )}
        </ColorCodingContext.Consumer>
    );
}
