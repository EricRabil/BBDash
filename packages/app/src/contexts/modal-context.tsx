import React, { createContext, useMemo, useState } from "react";

type ModalContextArrayRepresentation = [ boolean, () => void ];
export interface ModalContextObjectRepresentation {
    isShowing: boolean;
    isBusy: boolean;
    toggleShowing(): void;
    setBusy(isBusy: boolean): void;
}

export type ModalContextState = ModalContextObjectRepresentation & ModalContextArrayRepresentation;

export const ModalContext = createContext<ModalContextState>(Object.assign([ false, () => undefined ] as ModalContextArrayRepresentation, {
    isShowing: false,
    isBusy: false,
    toggleShowing: () => undefined,
    setBusy: () => undefined
}) as ModalContextState);

export function ModalContextProvider({ children }: {
    children: (api: ModalContextState) => React.ReactNode
}) {
    const [ isShowing, setIsShowing ] = useState(false);
    const [ isBusy, setBusy ] = useState(false);
    
    const toggleShowing = () => {
        setIsShowing(!isShowing);
    };

    const api = useMemo(() => Object.assign([ isShowing, toggleShowing ], {
        isShowing,
        toggleShowing,
        isBusy,
        setBusy
    }) as ModalContextState, [ isShowing, isBusy ]);

    return (
        <ModalContext.Provider value={api}>
            {children(api)}
        </ModalContext.Provider>
    );
}