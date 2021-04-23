import React, { ReactNode, useCallback, useContext } from "react";
import { CirclePicker, ColorResult } from "react-color";
import { ColorCodingContext } from "../../../../contexts/color-coding-context";

export interface LabeledColorPickerProps {
    label: ReactNode;
    colorIndex?: number;
    setColorIndex: (index: number) => void;
}

export default function LabeledColorPicker({ label, colorIndex, setColorIndex }: LabeledColorPickerProps) {
    const { colors } = useContext(ColorCodingContext);

    const colorChanged = useCallback(({ hex }: ColorResult) => setColorIndex(colors.indexOf(hex)), [setColorIndex, colors]);

    return (
        <div className="bb-color-picker">
            <div className="bb-color-picker--label">{label}</div>

            <CirclePicker colors={colors} color={colors[colorIndex!]} circleSpacing={7} circleSize={21} width={"252px"} onChangeComplete={colorChanged} />
        </div>
    );
}