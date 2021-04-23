import React from "react";
import { usePreference } from "../../../contexts/column-settings-context";
import LabeledColorPicker from "./support/LabeledColorPicker";

export default function ColumnColorCoding() {
    const [ headerColorIndex, setHeaderColorIndex ] = usePreference("headerColor");
    const [ name ] = usePreference("name");

    return (
        <LabeledColorPicker label={name} colorIndex={headerColorIndex} setColorIndex={setHeaderColorIndex} />
    );
}