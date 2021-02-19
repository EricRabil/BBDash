import { useEffect } from "react";
import { BasePreferences, ColumnOptions } from "../components/Column";

export function useDefaultPreferences<Preferences extends BasePreferences>(props: ColumnOptions<Preferences>, defaults: Preferences) {
    function inspect() {
        if (!Object.keys(defaults).every(key => key in props.preferences)) {
            props.updatePreferences(Object.assign({}, Object.entries(defaults).filter(([ key ]) => !(key in props.preferences)).reduce((acc, [key, value]) => Object.assign(acc, {
                [key]: value
            }), {}), props.preferences));
        }
    }

    useEffect(() => inspect());
}

export function useMergePreferences<Preferences extends BasePreferences>(props: ColumnOptions<Preferences>) {
    return function(partial: Partial<Preferences>) {
        props.updatePreferences(Object.assign({}, props.preferences, partial));
    };
}