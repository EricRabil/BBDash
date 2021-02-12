import React from "react";
import { useMergePreferences } from "../composables/useDefaultPreferences";
import { BasePreferences, ColumnOptions } from "./Column";

export interface ColumnSettingsFieldOptions<Preferences extends BasePreferences> extends ColumnOptions<Preferences> {
    type: string;
    labelText: React.ReactNode;
    prefKey: keyof Preferences;
}

export default function ColumnSettingsField<Preferences extends BasePreferences>(props: ColumnSettingsFieldOptions<Preferences>) {
    const merge = useMergePreferences(props);
    const preferenceValue = props.preferences[props.prefKey];

    type PreferenceValue = Preferences[(typeof props.prefKey)];

    return (
        <label>
            {props.type === "checkbox" ? null : props.labelText}

            <input type={props.type} checked={props.type === "checkbox" ? preferenceValue as unknown as boolean : false} value={props.type === "checkbox" ? undefined : preferenceValue as unknown as string} onChange={event => {
                switch (props.type) {
                case "checkbox":
                    merge({ [props.prefKey]: event.currentTarget.checked as unknown as PreferenceValue } as Partial<Preferences>);
                    break;
                default:
                    merge({ [props.prefKey]: event.currentTarget.value as unknown as PreferenceValue } as Partial<Preferences>);
                }
            }} />

            {props.type === "checkbox" ? props.labelText : null}
        </label>
    );
}