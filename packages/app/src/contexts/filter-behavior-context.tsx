import React, { createContext, PropsWithChildren, useCallback, useContext, useState } from "react";

export interface FilterBehaviorState {
    uriFiltersAreDisabled: boolean;
    uriFiltersAreDisabledLocally: boolean;
    uriFiltersAreDisabledGlobally: boolean;
    userFiltersAreDisabled: boolean;
    userFiltersAreDisabledLocally: boolean;
    userFiltersAreDisabledGlobally: boolean;
    setUriFiltersAreDisabled: (disabled: boolean, globally?: boolean) => void;
    setUserFiltersAreDisabled: (disabled: boolean, globally?: boolean) => void;
    isDefault: boolean;
}

export const FilterBehaviorContext = createContext<FilterBehaviorState>({
    uriFiltersAreDisabled: false,
    uriFiltersAreDisabledLocally: false,
    uriFiltersAreDisabledGlobally: false,
    userFiltersAreDisabled: false,
    userFiltersAreDisabledLocally: false,
    userFiltersAreDisabledGlobally: false,
    setUriFiltersAreDisabled: () => undefined,
    setUserFiltersAreDisabled: () => undefined,
    isDefault: true
});

export function FilterBehaviorProvider({ children }: PropsWithChildren<{}>) {
    const { uriFiltersAreDisabled: uriFiltersAreDisabledGlobally, userFiltersAreDisabled: userFiltersAreDisabledGlobally, setUriFiltersAreDisabled: setUriFiltersAreDisabledGlobally, setUserFiltersAreDisabled: setUserFiltersAreDisabledGlobally, isDefault: isRoot } = useContext(FilterBehaviorContext);

    const [ uriFiltersAreDisabledLocally, setUriFiltersAreDisabledLocally ] = useState<boolean>(false);
    const [ userFiltersAreDisabledLocally, setUserFiltersAreDisabledLocally ] = useState<boolean>(false);

    const uriFiltersAreDisabled = uriFiltersAreDisabledGlobally || uriFiltersAreDisabledLocally;
    const userFiltersAreDisabled = userFiltersAreDisabledGlobally || userFiltersAreDisabledLocally;

    return (
        <FilterBehaviorContext.Provider value={{
            uriFiltersAreDisabled,
            uriFiltersAreDisabledLocally,
            uriFiltersAreDisabledGlobally,
            userFiltersAreDisabled,
            userFiltersAreDisabledLocally,
            userFiltersAreDisabledGlobally,
            setUriFiltersAreDisabled: useCallback((disabled, globally) => {
                if (globally && !isRoot) setUriFiltersAreDisabledGlobally(disabled, globally);
                else setUriFiltersAreDisabledLocally(disabled);
            }, [setUriFiltersAreDisabledGlobally, setUriFiltersAreDisabledLocally]),
            setUserFiltersAreDisabled: useCallback((disabled, globally) => {
                if (globally && !isRoot) setUserFiltersAreDisabledGlobally(disabled, globally);
                else setUserFiltersAreDisabledLocally(disabled);
            }, [setUserFiltersAreDisabledGlobally, setUserFiltersAreDisabledLocally]),
            isDefault: false
        }}>
            {children}
        </FilterBehaviorContext.Provider>
    );
}