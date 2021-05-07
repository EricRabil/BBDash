import { useContext, useMemo } from "react";
import { ColorCodingContext } from "../contexts/color-coding-context";

export function useColorPaletteCSSVariables(): Record<string, string> {
    const { courseColorPreferences, columnHeaderColor, colors, secondaryColors, textColors, secondaryTextColors, defaultCellColor, defaultTextColor, background, sidebarColor } = useContext(ColorCodingContext);

    const colorPaletteVariables = useMemo(() => {
        const backgroundVariables: [string, string][] = colors.map((color, index) => [`--palette-background-color-${index}`, color]);
        const secondaryBackgroundVariables: [string, string][] = secondaryColors.map((color, index) => [`--palette-background-secondary-color-${index}`, color]);
        const textVariables: [string, string][] = textColors.map((color, index) => [`--palette-text-color-${index}`, color]);
        const secondaryTextVariables: [string, string][] = secondaryTextColors.map((color, index) => [`--palette-text-secondary-color-${index}`, color]);

        return Object.fromEntries(backgroundVariables.concat(textVariables).concat(secondaryBackgroundVariables).concat(secondaryTextVariables).concat([
            ["--palette-default-background-color", defaultCellColor],
            ["--palette-default-text-color", defaultTextColor],
            ["--palette-app-background-color", background],
            ["--palette-app-sidebar-background-color", sidebarColor],
            ["--palette-column-header-text-color", columnHeaderColor]
        ]));
    }, [colors, columnHeaderColor, textColors]);

    const courseColorVariables = useMemo(() => {
        const backgroundVariables: [string, string][] = Object.entries(courseColorPreferences).map(([ courseID, courseColorIndex ]) => [`--course-background-${courseID}`, `var(--palette-background-color-${courseColorIndex})`]);
        const textVariables: [string, string][] = Object.entries(courseColorPreferences).map(([ courseID, courseColorIndex ]) => [`--course-text-color-${courseID}`, `var(--palette-text-color-${courseColorIndex})`]);

        return Object.fromEntries(backgroundVariables.concat(textVariables));
    }, [colorPaletteVariables, courseColorPreferences]);

    return useMemo(() => Object.assign({}, colorPaletteVariables, courseColorVariables), [colorPaletteVariables, courseColorVariables]);
}
