import { useEffect, useState } from "react";

export interface ModifierKeyState {
    shift: boolean;
    meta: boolean;
    alt: boolean;
    ctrl: boolean;
}

export function useModifierKeys() {
    const [ shift, setShift ] = useState(false);
    const [ meta, setMeta ] = useState(false);
    const [ alt, setAlt ] = useState(false);
    const [ ctrl, setCtrl ] = useState(false);

    useEffect(() => {
        function keyListener({ shiftKey, metaKey, altKey, ctrlKey }: KeyboardEvent) {
            setShift(shiftKey);
            setMeta(metaKey);
            setAlt(altKey);
            setCtrl(ctrlKey);
        }

        document.addEventListener("keydown", keyListener, { passive: true });
        document.addEventListener("keyup", keyListener, { passive: true });

        return () => {
            document.removeEventListener("keydown", keyListener);
            document.removeEventListener("keyup", keyListener);
        };
    });

    return {
        shift,
        meta,
        alt,
        ctrl
    };
}