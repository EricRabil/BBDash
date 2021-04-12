import React, { PropsWithChildren, useMemo } from "react";
import { usePersistent } from "react-use-persistent";
import useCourses from "../composables/useCourses";

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
        colors: ["#03071e","#370617","#6a040f","#9d0208","#d00000","#dc2f02","#e85d04","#f48c06","#faa307","#ffba08",],
        background: "#000000"
    },
    cool: {
        colors: ["#7400b8","#6930c3","#5e60ce","#5390d9","#4ea8de","#48bfe3","#56cfe1","#64dfdf","#72efdd","#80ffdb",],
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
    background: string;
    colors: string[];
    setColorPaletteID(id: ColorPaletteIdentifier): void;
    setCourseColorPreference(courseID: string, colorIndex: number): void;
}

export const ColorCodingContext = React.createContext({} as ColorCodingState);

type CourseColorPreferences = Record<string, number>;

export function ColorCodingProvider({ children }: PropsWithChildren<{}>) {
    const [ colorPaletteID, setColorPaletteID ] = usePersistent<ColorPaletteIdentifier>("color-palette", "dark");
    const [ courseColorPreferences, setCourseColorPreferences ] = usePersistent<CourseColorPreferences>("course-color-preferences", {});

    const { colors, background } = ColorPalettes[colorPaletteID];

    const courses = useCourses();

    const courseColors = useMemo(() => Object.fromEntries(Object.keys(courses).map(courseID => (
        [courseID, colors[courseColorPreferences[courseID] || 0]]
    ))), [ colorPaletteID, courseColorPreferences, courses ]);

    return (
        <ColorCodingContext.Provider value={{
            colorPaletteID,
            colorPaletteIDs,
            courseColors,
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