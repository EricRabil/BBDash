import React, { PropsWithChildren, useMemo } from "react";
import { useSelector } from "react-redux";
import { usePersistent } from "react-use-persistent";
import { selectCourses } from "../store/reducers/courses";
import { mapObject } from "../utils/object";

const defaultColors = [
    "#f44336", "#e91e63",
    "#9c27b0", "#673ab7",
    "#3f51b5", "#2196f3",
    "#03a9f4", "#00bcd4",
    "#009688", "#4caf50",
    "#8bc34a", "#cddc39",
    "#ffeb3b", "#ffc107",
    "#ff9800", "#ff5722",
    "#795548", "#607d8b",
];

export interface ColorPalette {
    colors: string[];
    background: string;
}

export const ColorPalettes = {
    warm: {
        colors: ["#49081f","#6a040f","#9d0208","#d00000","#dc2f02","#e85d04","#db7e06","#dc9104","#e0a100"],
        background: "#000000"
    },
    cool: {
        colors: ["#4e007a","#3d1d72","#1d1e5d","#123054","#103b56","#11556a","#0f4e57","#115555","#0a5c50"],
        background: "#1d3557",
    },
    light: {
        colors: defaultColors,
        background: "#324a54",
    },
    dark: {
        colors: defaultColors,
        background: "#141e26",
    },
    pastel: {
        colors: ["#ffadad","#ffd6a5","#fdffb6","#caffbf","#9bf6ff","#a0c4ff","#bdb2ff","#ffc6ff","#fffffc",],
        background: "#ffffff",
    }
};

const colorPaletteIDs = Object.keys(ColorPalettes) as unknown as ColorPaletteIdentifier[];

export type ColorPaletteIdentifier = keyof typeof ColorPalettes;

export interface ColorCodingState {
    colorPaletteID: ColorPaletteIdentifier;
    colorPaletteIDs: ColorPaletteIdentifier[];
    courseColors: Record<string, string>;
    courseTextColors: Record<string, string>;
    background: string;
    colors: string[];
    setColorPaletteID(id: ColorPaletteIdentifier): void;
    setCourseColorPreference(courseID: string, colorIndex: number): void;
}

/**
 * Provides APIs and data for displaying and configuring colors in the app
 */
export const ColorCodingContext = React.createContext({} as ColorCodingState);

type CourseColorPreferences = Record<string, number>;

type RGB = [number, number, number];

function hexToRGB(hex: string): RGB {
    if (hex[0] === "#") hex = hex.slice(1);
    if (hex.length <= 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];

    const asNumerical = parseInt(hex, 16);
    return [asNumerical >> 16 & 255, asNumerical >> 8 & 255, asNumerical & 255];
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

    const { colors, background } = ColorPalettes[colorPaletteID];

    const courses = useSelector(selectCourses);

    const courseColors = useMemo(() => mapObject(courses, courseID => (
        [courseID, colors[courseColorPreferences[courseID] || 0]]
    )), [ colorPaletteID, courseColorPreferences, courses ]);

    const courseTextColors = useMemo(() => mapObject(courseColors, ([ courseID, background ]) => (
        [ courseID, textColorForHex(background || "#ffffff") ]
    )), [ courseColors ]);

    console.log(courseTextColors);

    return (
        <ColorCodingContext.Provider value={{
            colorPaletteID,
            colorPaletteIDs,
            courseColors,
            courseTextColors,
            background,
            colors,
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