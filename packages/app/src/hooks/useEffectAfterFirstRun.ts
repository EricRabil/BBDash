import { useRef, useLayoutEffect, useEffect } from "react";

export default function useEffectAfterFirstRun(effect: React.EffectCallback, deps?: React.DependencyList | undefined, layoutEffect = true) {
    const isFirstRun = useRef(true);

    return (layoutEffect ? useLayoutEffect : useEffect)(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        effect();
    }, deps);
}