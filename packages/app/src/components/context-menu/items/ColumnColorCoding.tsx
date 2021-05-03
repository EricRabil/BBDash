import React from "react";
import { PreferenceConsumer } from "../../../contexts/column-settings-context";
import LabeledColorPicker from "./support/LabeledColorPicker";

function ColumnNameEditor() {
    return (
        <PreferenceConsumer preferenceKey="name">
            {([ name, setName ]) => (
                <input className="no-coreui" type="text" value={name} onChange={e => setName(e.currentTarget.value)} />
            )}
        </PreferenceConsumer>
    );
}

export default function ColumnColorCoding() {
    return (
        <PreferenceConsumer preferenceKey="headerColor">
            {([ headerColorIndex, setHeaderColorIndex ]) => (
                <LabeledColorPicker label={<ColumnNameEditor />} colorIndex={headerColorIndex} setColorIndex={setHeaderColorIndex} />
            )}
        </PreferenceConsumer>
    );
}