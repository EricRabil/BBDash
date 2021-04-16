import React, { ReactNode, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type ModalContextArrayRepresentation = [ boolean, () => void ];
export interface ModalContextObjectRepresentation {
    isShowing: boolean;
    toggleShowing(): void;
}

export type ModalContext = ModalContextObjectRepresentation & ModalContextArrayRepresentation;

export function useModal(): ModalContext {
    const [ isShowing, setIsShowing ] = useState(false);
    
    const toggleShowing = () => {
        setIsShowing(!isShowing);
    };

    return Object.assign([ isShowing, toggleShowing ], {
        isShowing,
        toggleShowing
    }) as ModalContext;
}

export interface ModalContentContext extends ModalContextObjectRepresentation {
    isDisappearing: boolean;
    isAppearing: boolean;
    isTransitioning: boolean;
    didFinish(): void;
}

export interface ModalProps extends ModalContextObjectRepresentation {
    children: (ctx: ModalContentContext) => ReactNode
}

function useEffectAfterFirstRun(effect: React.EffectCallback, deps?: React.DependencyList | undefined) {
    const isFirstRun = useRef(true);

    return useLayoutEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        effect();
    }, deps);
}

export default function Modal({ children, ...ctx }: ModalProps) {
    const [ didComplete, setDidComplete ] = useState(true);
    const [ isTransitioning, setIsTransitioning ] = useState(false);
    const [ isAppearing, setIsAppearing ] = useState(false);
    const [ isDisappearing, setIsDisappearing ] = useState(false);

    useEffectAfterFirstRun(() => {
        if (didComplete) {
            setIsTransitioning(false);
            setIsAppearing(false);
            setIsDisappearing(false);
        }
    }, [didComplete]);

    useEffectAfterFirstRun(() => {
        setDidComplete(false);
        setIsTransitioning(true);
        setIsAppearing(ctx.isShowing);
        setIsDisappearing(!ctx.isShowing);
    }, [ctx.isShowing]);

    const modalContentContext: ModalContentContext = {
        isDisappearing,
        isAppearing,
        isTransitioning,
        didFinish: () => setDidComplete(true),
        ...ctx
    };

    return (ctx.isShowing || isTransitioning) ? (
        createPortal(
            children(modalContentContext),
            document.body
        )
    ) : null;
}