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
        function keyDownListener({ shiftKey, metaKey, altKey, ctrlKey }: KeyboardEvent) {
            setShift(shiftKey);
            setMeta(metaKey);
            setAlt(altKey);
            setCtrl(ctrlKey);
        }

        function keyUpListener() {
            setShift(false);
            setMeta(false);
            setAlt(false);
            setCtrl(false);
        }

        document.addEventListener("keydown", keyDownListener, { passive: true });
        document.addEventListener("keyup", keyUpListener, { passive: true });

        return () => {
            document.removeEventListener("keydown", keyDownListener);
            document.removeEventListener("keyup", keyUpListener);
        };
    });

    return {
        shift,
        meta,
        alt,
        ctrl
    };
}