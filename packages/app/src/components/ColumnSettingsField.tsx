import React, { useMemo } from "react";
import { useMergePreferences } from "../composables/useDefaultPreferences";
import { BasePreferences, ColumnOptions } from "./Column";

export interface ColumnSettingsFieldOptions<Preferences extends BasePreferences> extends ColumnOptions<Preferences> {
    type: string;
    labelText: React.ReactNode;
    prefKey?: keyof Preferences;
    onUpdate?: (value: unknown) => void;
    value?: unknown;
}

export interface ColumnSettingsListFieldOptions<Preferences extends BasePreferences> extends Omit<ColumnSettingsFieldOptions<Preferences>, "labelText"> {
    values: string[];
    multi: boolean;
    prefKey: keyof Preferences;
    header: React.ReactNode;
    labelText: (value: string) => React.ReactNode;
}

/**
 * HOC that manages a list of checkbox/radio items
 * @param props 
 */
export function ColumnSettingsListField<Preferences extends BasePreferences>({ multi, header, prefKey, labelText, values, updatePreferences, remove, preferences }: ColumnSettingsListFieldOptions<Preferences>) {
    const expectedType = multi ? "object" : "string";

    type Ledger = Record<string, boolean>;
    type PrefValue = Preferences[keyof Preferences];

    // dictionary representing the states of the various possible values
    const ledger = useMemo(() => values.reduce((acc, key) => Object.assign(acc, {
        // @ts-ignore
        [key]: expectedType === "string" ? preferences[prefKey] === key : !!(preferences[prefKey] || {})[key]
    }), {} as Ledger), [preferences, preferences[prefKey]]);

    // ensures the value of preferences[prefKey] is in the proper format, otherwise correcting it
    function assure() {
        if (typeof preferences[prefKey] !== expectedType) {
            switch (expectedType) {
            case "object":
                updatePreferences({
                    ...preferences,
                    [prefKey]: values.reduce((acc, c) => Object.assign(acc, { [c]: false }), {})
                });
                break;
            case "string":
                updatePreferences({
                    ...preferences,
                    [prefKey]: null
                });
                break;
            }
        }
    }

    function write(key: string, value: boolean) {
        assure();

        switch (expectedType) {
        case "object":
            updatePreferences({
                ...preferences,
                [prefKey]: {
                    ...preferences[prefKey],
                    [key]: value
                }
            });
            break;
        case "string":
            updatePreferences({
                ...preferences,
                [prefKey]: value ? key : (!value && preferences[prefKey] === key as unknown as PrefValue) ? null : preferences[prefKey]
            });
            break;
        }
    }

    const chunkName = `${Date.now().toString()}-${prefKey}`;

    return (
        <div className="column-settings-list">
            <div className="column-settings-list--header">
                {header}
            </div>
            <div className="column-settings-list--body">
                {values.map(key => (
                    <ColumnSettingsField key={key} type={multi ? "checkbox" : "radio"} name={chunkName} labelText={labelText(key)} onUpdate={value => write(key, value as boolean)} value={ledger[key]} {...{ updatePreferences, remove, preferences }} />
                ))}
            </div>
        </div>
    );
}

/**
 * Lower-level component for configuring a section of the preferences object. Can be overridden to delegate read/writes to a HOC
 * @param props options for the columnn settings
 */
export default function ColumnSettingsField<Preferences extends BasePreferences>(props: ColumnSettingsFieldOptions<Preferences>) {
    const merge = useMergePreferences(props);
    const preferenceValue = props.prefKey ? props.preferences[props.prefKey] : (props.value || false);

    /**
     * Updates or delegates an updates value
     * @param value new value
     */
    function apply(value: unknown) {
        if (props.prefKey) merge({ [props.prefKey]: value } as Partial<Preferences>);
        else props.onUpdate!(value);
    }

    // whether this is a selectable input
    const isCheckable = useMemo(() => ["checkbox", "radio"].includes(props.type), [props.type]);

    return (
        <label>
            {props.type === "checkbox" ? null : props.labelText}

            <input type={props.type} checked={isCheckable ? preferenceValue as unknown as boolean : false} name={props.name} value={isCheckable ? undefined : preferenceValue as unknown as string} onChange={event => {
                switch (props.type) {
                case "checkbox":
                case "radio":
                    apply(event.currentTarget.checked);
                    break;
                default:
                    apply(event.currentTarget.value);
                }
            }} />

            {props.type === "checkbox" ? props.labelText : null}
        </label>
    );
}