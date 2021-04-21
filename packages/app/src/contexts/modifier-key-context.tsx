import React, { createContext, PropsWithChildren } from "react";
import { ModifierKeyState, useModifierKeys } from "../hooks/useModifierKeys";

export const ModifierKeyContext = createContext<ModifierKeyState>({
    shift: false,
    meta: false,
    alt: false,
    ctrl: false
});

export function ModifierKeyProvider({ children }: PropsWithChildren<{}>) {
    const modifierKeys = useModifierKeys();

    return (
        <ModifierKeyContext.Provider value={modifierKeys}>
            {children}
        </ModifierKeyContext.Provider>
    );
}