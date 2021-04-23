import React from "react";
import { usePreference } from "../../../contexts/column-settings-context";
import LabeledColorPicker from "./support/LabeledColorPicker";

export default function ColumnColorCoding() {
    const [ headerColorIndex, setHeaderColorIndex ] = usePreference("headerColor");
    const [ name, setName ] = usePreference("name");

    return (
        <LabeledColorPicker label={<input className="no-coreui" type="text" value={name} onChange={e => setName(e.currentTarget.value)} />} colorIndex={headerColorIndex} setColorIndex={setHeaderColorIndex} />
    );
}