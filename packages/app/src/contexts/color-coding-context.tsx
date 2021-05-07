import React, { PropsWithChildren } from "react";
import { usePersistent } from "react-use-persistent";

export interface ColorPalette {
    colors: string[];
    secondaryColors: string[];
    secondaryTextColors: string[];
    textColors: string[];
    defaultCellColor: string;
    defaultTextColor: string;
    columnHeaderColor: string;
    background: string;
    sidebarColor: string;
}

function makeColorPalette(base: Omit<ColorPalette, "textColors" | "defaultTextColor" | "secondaryColors" | "secondaryTextColors">, secondaryModifier: number): ColorPalette {
    const makeText = (colors: string[]) => colors.map(color => textColorForHex(color));
    const secondaryColors = base.colors.map(color => modulateHex(color, secondaryModifier));

    return {
        ...base,
        textColors: makeText(base.colors),
        defaultTextColor: textColorForHex(base.defaultCellColor),
        secondaryColors,
        secondaryTextColors: makeText(secondaryColors)
    };
}

export const ColorPalettes: Record<string, ColorPalette> = {
    dark: makeColorPalette({
        // colors: ["#78bb5d","#ecd747","#f1a340","#d9644f","#b87bda","#3477ba","#57bedc","#ee80c7","#854196"],
        colors: ["#caffbf","#fdffb6","#ffd6a5","#ffadad","#bdb2ff","#a0c4ff","#9bf6ff","#ddd6ff","#ffc6ff"],
        defaultCellColor: "#c5c9cc",
        sidebarColor: "#20303e",
        columnHeaderColor: "#ffffff",
        background: "rgb(22,40,53)",
    }, -40),
    light: makeColorPalette({
        colors: ["#caffbf","#fdffb6","#ffd6a5","#ffadad","#bdb2ff","#a0c4ff","#9bf6ff","#ddd6ff","#ffc6ff"],
        defaultCellColor: "#e3e3e3",
        sidebarColor: "#385e80",
        columnHeaderColor: "#000000",
        background: "#ffffff",
    }, 40)
};

const colorPaletteIDs = Object.keys(ColorPalettes) as unknown as ColorPaletteIdentifier[];

export type ColorPaletteIdentifier = keyof typeof ColorPalettes;

export interface ColorCodingState extends ColorPalette {
    colorPaletteID: ColorPaletteIdentifier;
    colorPaletteIDs: ColorPaletteIdentifier[];
    courseColorPreferences: Record<string, number>;
    setColorPaletteID(id: ColorPaletteIdentifier): void;
    setCourseColorPreference(courseID: string, colorIndex: number): void;
}

const paletteIDs = Object.keys(ColorPalettes) as ColorPaletteIdentifier[];
const defaultPaletteID = paletteIDs[0];
const defaultPalette = ColorPalettes[defaultPaletteID];

/**
 * Provides APIs and data for displaying and configuring colors in the app
 */
export const ColorCodingContext = React.createContext<ColorCodingState>({
    colorPaletteID: defaultPaletteID,
    colorPaletteIDs: paletteIDs,
    ...defaultPalette,
    courseColorPreferences: {},
    setColorPaletteID: () => undefined,
    setCourseColorPreference: () => undefined
});

type CourseColorPreferences = Record<string, number>;

type RGB = [number, number, number];

function hexToRGB(hex: string): RGB {
    if (hex[0] === "#") hex = hex.slice(1);
    if (hex.length <= 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];

    const asNumerical = parseInt(hex, 16);
    return [asNumerical >> 16 & 255, asNumerical >> 8 & 255, asNumerical & 255];
}

function rgbToHex([ r, g, b ]: RGB): string {
    const decToHex = (dec: number) => {
        let char = Math.max(Math.min(255, dec), 0).toString(16);
        if (char.length === 1) char += "0";
        return char;
    };

    return `#${decToHex(r)}${decToHex(g)}${decToHex(b)}`;
}

function modulateHex(hex: string, modifier: number): string {
    let rgb = hexToRGB(hex);
    rgb = rgb.map(component => component + modifier) as RGB;
    return rgbToHex(rgb);
}

function textColorForHex(hex: string): string {
    // https://www.w3.org/TR/AERT/#color-contrast
    const [ red, green, blue ] = hexToRGB(hex);

    const brightness = Math.round(((red * 299) + (green * 587) + (blue * 114)) / 1000);

    return brightness > 125 ? "#000000" : "#ffffff";
}

export function ColorCodingProvider({ children }: PropsWithChildren<{}>) {
    const [ colorPaletteID, setColorPaletteID ] = usePersistent<ColorPaletteIdentifier>("color-palette", "dark");
    const [ courseColorPreferences, setCourseColorPreferences ] = usePersistent<CourseColorPreferences>("course-color-preferences", {});

    return (
        <ColorCodingContext.Provider value={{
            colorPaletteID,
            colorPaletteIDs,
            ...ColorPalettes[colorPaletteID],
            courseColorPreferences,
            setColorPaletteID,
            setCourseColorPreference: (courseID, colorIndex) => {
                setCourseColorPreferences(Object.assign({}, courseColorPreferences, {
                    [courseID]: colorIndex
                }));
            }
        }}>
            {children}
        </ColorCodingContext.Provider>
    );
}