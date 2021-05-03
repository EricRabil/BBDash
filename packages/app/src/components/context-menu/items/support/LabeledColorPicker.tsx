import React, { ReactNode } from "react";
import { CirclePicker } from "react-color";
import { ColorCodingContext } from "../../../../contexts/color-coding-context";

export interface LabeledColorPickerProps {
    label: ReactNode;
    colorIndex?: number;
    setColorIndex: (index: number) => void;
}

export default function LabeledColorPicker({ label, colorIndex, setColorIndex }: LabeledColorPickerProps) {
    return (
        <div className="bb-color-picker">
            <div className="bb-color-picker--label">{label}</div>

            <ColorCodingContext.Consumer>
                {({ colors }) => (
                    <CirclePicker colors={colors} color={colors[colorIndex!]} circleSpacing={7} circleSize={21} width={"252px"} onChangeComplete={({ hex }) => {
                        setColorIndex(colors.indexOf(hex));
                    }} />
                )}
            </ColorCodingContext.Consumer>
        </div>
    );
}