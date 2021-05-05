import React, { ReactNode, useContext, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ModalContext } from "../../contexts/modal-context";

export interface ModalContentContext {
    isDisappearing: boolean;
    isAppearing: boolean;
    isTransitioning: boolean;
    didFinish(): void;
}

export interface ModalProps {
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

/**
 * Helper for managing the transition of a Modal as it enters and exits
 */
export default function Modal({ children }: ModalProps) {
    const ctx = useContext(ModalContext);
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