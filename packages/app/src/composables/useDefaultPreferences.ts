import { useEffect } from "react";
import { BasePreferences, ColumnOptions } from "../components/Column";

export function useDefaultPreferences<Preferences extends BasePreferences>(props: ColumnOptions<Preferences>, defaults: Preferences) {
    useEffect(() => {
        if (!Object.keys(defaults).every(key => key in props.preferences)) {
            console.log("FUCK");
            props.updatePreferences(Object.assign({}, defaults, props.preferences));
        }
    }, [props.preferences]);
}

export function useMergePreferences<Preferences extends BasePreferences>(props: ColumnOptions<Preferences>) {
    return function(partial: Partial<Preferences>) {
        props.updatePreferences(Object.assign({}, props.preferences, partial));
    };
}